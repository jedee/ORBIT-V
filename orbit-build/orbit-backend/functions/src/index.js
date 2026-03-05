/**
 * Orbit Cloud Functions — Entry Point
 * ─────────────────────────────────────────────────────────────────────────────
 * Exported functions:
 *
 *   conversationMessage   onCall  — main conversation engine
 *   syncUserStats         onCall  — frontend pushes daily stats to Firestore
 *   addFriend             onCall  — add a friend by Orbit ID
 *   removeFriend          onCall  — remove a friend
 *   getLeaderboard        onCall  — fetch friend leaderboard data (for app UI)
 *   scheduledCleanup      onSchedule — hourly cleanup of expired sessions
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onCall, HttpsError }       = require('firebase-functions/v2/https');
const { onSchedule }               = require('firebase-functions/v2/scheduler');
const logger                       = require('firebase-functions/logger');

// Initialise Firebase Admin SDK
initializeApp();

const { processMessage }  = require('./engine/flowEngine');
const { checkRateLimit }  = require('./middleware/rateLimit');
const { isDuplicate }     = require('./middleware/dedup');
const { normalise }       = require('./providers/inApp');

// ── Helper ───────────────────────────────────────────────────────────────────

function requireAuth(auth) {
  if (!auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required.');
}

// ── conversationMessage ───────────────────────────────────────────────────────

/**
 * Main conversation engine.
 * Called from the frontend with: { message: "calculate tax" }
 *
 * Returns: { type, message, data, done, options }
 */
exports.conversationMessage = onCall(
  { region: 'us-central1', timeoutSeconds: 30, memory: '256MiB' },
  async (request) => {
    requireAuth(request.auth);

    // Normalise
    const { userId, text, context } = normalise(request.data, request.auth);

    if (!text) {
      throw new HttpsError('invalid-argument', 'message is required');
    }

    // Rate limiting
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.allowed) {
      const resetIn = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      throw new HttpsError(
        'resource-exhausted',
        `Too many messages. Please wait ${resetIn} seconds.`,
      );
    }

    // Deduplication
    const duplicate = await isDuplicate(userId, text);
    if (duplicate) {
      logger.info('Duplicate message ignored', { userId });
      throw new HttpsError('already-exists', 'Duplicate message.');
    }

    // Process
    logger.info('Processing message', { userId, textLength: text.length });
    const response = await processMessage(userId, text, context);

    return response;
  },
);

// ── syncUserStats ─────────────────────────────────────────────────────────────

/**
 * Frontend calls this whenever stats change (streak, perfect days, ring progress).
 * Keeps Firestore in sync with the local app state.
 *
 * Payload: { streak, totalPerfect, todayPct, goals, history }
 */
exports.syncUserStats = onCall(
  { region: 'us-central1', timeoutSeconds: 15, memory: '128MiB' },
  async (request) => {
    requireAuth(request.auth);
    const { uid } = request.auth;
    const { streak, totalPerfect, todayPct, goals, todayKey } = request.data;

    const db = getFirestore();
    const batch = db.batch();

    // Update user public stats
    batch.set(
      db.collection('users').doc(uid),
      {
        streak:       streak ?? 0,
        totalPerfect: totalPerfect ?? 0,
        todayPct:     todayPct ?? 0,
        goals:        goals ?? [],
        updatedAt:    FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Store today's ring snapshot for history
    if (todayKey && goals) {
      const ringData = {};
      goals
        .filter((g) => g.pinned && g.active !== false)
        .forEach((g) => { ringData[g.id] = g.todayP || 0; });

      batch.set(
        db.collection('users').doc(uid).collection('rings').doc(todayKey),
        { ...ringData, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
    }

    await batch.commit();
    return { ok: true };
  },
);

// ── addFriend ─────────────────────────────────────────────────────────────────

/**
 * Adds a friend by Orbit ID.
 * Payload: { orbitId: "ORBIT-XXXXXX" }
 */
exports.addFriend = onCall(
  { region: 'us-central1', timeoutSeconds: 15, memory: '128MiB' },
  async (request) => {
    requireAuth(request.auth);
    const { uid } = request.auth;
    const { orbitId } = request.data;

    if (!orbitId || !/^ORBIT-[A-Z0-9]{6}$/i.test(orbitId)) {
      throw new HttpsError('invalid-argument', 'Invalid Orbit ID format.');
    }

    const db = getFirestore();

    // Resolve orbitId → uid
    const idDoc = await db.collection('orbitIds').doc(orbitId.toUpperCase()).get();
    if (!idDoc.exists) {
      throw new HttpsError('not-found', `No user found with Orbit ID ${orbitId}.`);
    }

    const friendUid = idDoc.data().uid;

    if (friendUid === uid) {
      throw new HttpsError('invalid-argument', "You can't add yourself.");
    }

    // Add bidirectional friend relationship
    const batch = db.batch();
    batch.set(
      db.collection('users').doc(uid).collection('friends').doc(friendUid),
      { addedAt: FieldValue.serverTimestamp(), orbitId: orbitId.toUpperCase() },
    );

    await batch.commit();

    // Fetch friend's public profile to return to UI
    const friendDoc = await db.collection('users').doc(friendUid).get();
    const f = friendDoc.data() || {};

    return {
      uid:          friendUid,
      orbitId:      orbitId.toUpperCase(),
      name:         f.displayName || f.name || 'Friend',
      streak:       f.streak || 0,
      totalPerfect: f.totalPerfect || 0,
      todayPct:     f.todayPct || 0,
      focus:        f.goals?.filter((g) => g.pinned).map((g) => g.category).slice(0, 3) || [],
    };
  },
);

// ── removeFriend ──────────────────────────────────────────────────────────────

/**
 * Removes a friend.
 * Payload: { friendUid: "..." }
 */
exports.removeFriend = onCall(
  { region: 'us-central1', timeoutSeconds: 10, memory: '128MiB' },
  async (request) => {
    requireAuth(request.auth);
    const { uid } = request.auth;
    const { friendUid } = request.data;

    if (!friendUid) throw new HttpsError('invalid-argument', 'friendUid is required.');

    const db = getFirestore();
    await db.collection('users').doc(uid).collection('friends').doc(friendUid).delete();

    return { ok: true };
  },
);

// ── getLeaderboard ────────────────────────────────────────────────────────────

/**
 * Returns the current user + their friends' public stats for the app UI.
 * This is the live data source replacing MOCK_FRIENDS.
 */
exports.getLeaderboard = onCall(
  { region: 'us-central1', timeoutSeconds: 20, memory: '128MiB' },
  async (request) => {
    requireAuth(request.auth);
    const { uid } = request.auth;
    const db = getFirestore();

    const [userDoc, friendSnap] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('users').doc(uid).collection('friends').limit(50).get(),
    ]);

    const friendUids = friendSnap.docs.map((d) => d.id);
    const friendDocs = await Promise.all(
      friendUids.map((fid) => db.collection('users').doc(fid).get()),
    );

    const pick = (d, isMe = false) => {
      const data = d.data() || {};
      return {
        uid:          d.id,
        orbitId:      data.orbitId || '',
        name:         data.displayName || data.name || (isMe ? 'You' : 'Friend'),
        streak:       data.streak || 0,
        totalPerfect: data.totalPerfect || 0,
        todayPct:     data.todayPct || 0,
        focus:        data.goals?.filter((g) => g.pinned).map((g) => g.category).slice(0, 3) || [],
        isMe,
      };
    };

    const friends = friendDocs.filter((d) => d.exists).map((d) => pick(d));

    return {
      me:      userDoc.exists ? pick(userDoc, true) : null,
      friends: friends.sort((a, b) => b.streak - a.streak || b.totalPerfect - a.totalPerfect),
    };
  },
);

// ── scheduledCleanup ──────────────────────────────────────────────────────────

/**
 * Hourly cleanup of expired conversation sessions and message hash records.
 */
exports.scheduledCleanup = onSchedule(
  { schedule: 'every 60 minutes', region: 'us-central1', timeoutSeconds: 120, memory: '128MiB' },
  async () => {
    const db = getFirestore();
    const now = new Date();
    let deleted = 0;

    // Clean expired conversations
    const expiredConvs = await db
      .collection('conversations')
      .where('expiresAt', '<', now)
      .limit(200)
      .get();

    const convBatch = db.batch();
    expiredConvs.docs.forEach((d) => { convBatch.delete(d.ref); deleted++; });
    if (!expiredConvs.empty) await convBatch.commit();

    // Clean old message hashes (older than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oldHashes = await db
      .collection('messageHashes')
      .where('seenAt', '<', oneHourAgo)
      .limit(500)
      .get();

    const hashBatch = db.batch();
    oldHashes.docs.forEach((d) => { hashBatch.delete(d.ref); deleted++; });
    if (!oldHashes.empty) await hashBatch.commit();

    logger.info(`Cleanup complete. Deleted ${deleted} records.`);
  },
);
