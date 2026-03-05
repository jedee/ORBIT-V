/**
 * Account Linking Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Links a Firebase Auth UID to an Orbit ID.
 *
 * Firestore structure:
 *   users/{uid}          — user profile + stats
 *   orbitIds/{orbitId}   — reverse lookup: orbitId → uid
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const R = require('../engine/responseBuilder');

/**
 * @param {object} data
 * @param {string} data.orbitId   - Validated ORBIT-XXXXXX string
 * @param {string} data.userId    - Firebase Auth UID
 * @param {object} data.context   - { displayName }
 * @returns {Promise<OrbitResponse>}
 */
async function run({ orbitId, userId, context = {} }) {
  const db = getFirestore();

  // Check if the Orbit ID is already claimed by a *different* user
  const idDoc = await db.collection('orbitIds').doc(orbitId).get();

  if (idDoc.exists && idDoc.data().uid !== userId) {
    return R.error(
      `That Orbit ID (${orbitId}) is already linked to another account. Each ID can only be linked once.`,
      'ORBIT_ID_TAKEN',
    );
  }

  // Check if this user already has an Orbit ID
  const userDoc = await db.collection('users').doc(userId).get();
  const existingId = userDoc.exists ? userDoc.data().orbitId : null;

  if (existingId && existingId !== orbitId) {
    // Already linked to a different ID — allow re-link by removing old reverse-lookup
    await db.collection('orbitIds').doc(existingId).delete();
  }

  // Link
  const batch = db.batch();

  batch.set(
    db.collection('users').doc(userId),
    {
      orbitId,
      displayName: context.displayName || null,
      linkedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  batch.set(db.collection('orbitIds').doc(orbitId), {
    uid: userId,
    linkedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();

  const action = existingId ? 're-linked' : 'linked';

  return R.result(
    [
      `✅ *Account ${action}!*`,
      '',
      `Your Orbit ID *${orbitId}* is now connected.`,
      '',
      'Your rings, streaks, and progress are now visible to friends who add your ID.',
      'They only see your rings and streak — never your income or spending.',
    ].join('\n'),
    { type: 'accountLink', orbitId },
  );
}

module.exports = { run };
