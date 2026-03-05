/**
 * Message Deduplication
 * ─────────────────────────────────────────────────────────────────────────────
 * Providers and clients can send duplicate messages. This middleware hashes
 * each message and ignores any that have been seen in the last 30 seconds.
 *
 * Firestore path: messageHashes/{hash}
 * TTL: 30 seconds (cleaned by scheduled function)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const crypto = require('crypto');

const DEDUP_WINDOW_MS = 30 * 1000;

/**
 * Creates a deterministic hash for a message.
 *
 * @param {string} userId
 * @param {string} text
 * @returns {string}
 */
function hashMessage(userId, text) {
  return crypto
    .createHash('sha256')
    .update(`${userId}::${text.trim().toLowerCase()}`)
    .digest('hex')
    .slice(0, 24);
}

/**
 * Checks if this message is a duplicate.
 * If not, records it so future duplicates are caught.
 *
 * @param {string} userId
 * @param {string} text
 * @returns {Promise<boolean>} true if this is a duplicate (should be ignored)
 */
async function isDuplicate(userId, text) {
  const db = getFirestore();
  const hash = hashMessage(userId, text);
  const ref = db.collection('messageHashes').doc(hash);
  const now = Date.now();

  try {
    const doc = await ref.get();

    if (doc.exists) {
      const seenAt = doc.data().seenAt?.toMillis?.() ?? 0;
      if (now - seenAt < DEDUP_WINDOW_MS) return true;
    }

    // Record this message
    await ref.set({ seenAt: Timestamp.fromMillis(now), userId });
    return false;
  } catch {
    return false; // Fail open
  }
}

module.exports = { isDuplicate, hashMessage };
