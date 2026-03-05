/**
 * Orbit Conversation State Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Stores per-user conversation state in Firestore.
 *
 * Firestore path: conversations/{userId}
 *
 * State shape:
 * {
 *   intent:    string,       // current active intent
 *   step:      number,       // which step of the flow we're on
 *   data:      object,       // accumulated inputs (salary, orbitId, etc.)
 *   expiresAt: Timestamp,    // TTL — state is cleared after 10 minutes idle
 *   updatedAt: Timestamp,
 *   channel:   string,       // 'in-app' (extensible for whatsapp, sms later)
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

/** Session TTL in milliseconds — 10 minutes */
const SESSION_TTL_MS = 10 * 60 * 1000;

const COLLECTION = 'conversations';

/**
 * Loads the current conversation state for a user.
 * Returns null if no active session or session has expired.
 *
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function getState(userId) {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(userId).get();

  if (!doc.exists) return null;

  const state = doc.data();
  const now = Date.now();
  const expiresAt = state.expiresAt?.toMillis?.() ?? 0;

  // Clear expired session
  if (expiresAt < now) {
    await clearState(userId);
    return null;
  }

  return state;
}

/**
 * Creates or updates conversation state for a user.
 *
 * @param {string} userId
 * @param {object} updates - Partial state to merge
 * @returns {Promise<void>}
 */
async function setState(userId, updates) {
  const db = getFirestore();
  const expiresAt = Timestamp.fromMillis(Date.now() + SESSION_TTL_MS);

  await db.collection(COLLECTION).doc(userId).set(
    {
      ...updates,
      expiresAt,
      updatedAt: FieldValue.serverTimestamp(),
      channel: updates.channel || 'in-app',
    },
    { merge: true },
  );
}

/**
 * Advances the flow to the next step.
 *
 * @param {string} userId
 * @param {object} newData - Data collected at current step to merge
 * @returns {Promise<void>}
 */
async function advanceStep(userId, newData = {}) {
  const db = getFirestore();
  const expiresAt = Timestamp.fromMillis(Date.now() + SESSION_TTL_MS);

  await db.collection(COLLECTION).doc(userId).update({
    step: FieldValue.increment(1),
    data: newData,   // caller builds the full data object
    expiresAt,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Clears the conversation state — used on completion, cancel, or error.
 *
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function clearState(userId) {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(userId).delete();
}

/**
 * Starts a new conversation flow from step 0.
 *
 * @param {string} userId
 * @param {string} intent
 * @returns {Promise<void>}
 */
async function startFlow(userId, intent) {
  await setState(userId, { intent, step: 0, data: {} });
}

module.exports = { getState, setState, advanceStep, clearState, startFlow };
