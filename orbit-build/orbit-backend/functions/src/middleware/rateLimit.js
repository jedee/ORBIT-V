/**
 * Rate Limiter
 * ─────────────────────────────────────────────────────────────────────────────
 * Prevents abuse. Limits each user to MAX_REQUESTS per WINDOW_MS.
 * Uses Firestore with a sliding window counter.
 *
 * Firestore path: rateLimits/{userId}
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

const MAX_REQUESTS = 30;          // per window
const WINDOW_MS    = 60 * 1000;   // 1 minute

/**
 * Checks and increments the rate limit counter for a user.
 *
 * @param {string} userId
 * @returns {Promise<{ allowed: boolean, remaining: number, resetAt: number }>}
 */
async function checkRateLimit(userId) {
  const db = getFirestore();
  const ref = db.collection('rateLimits').doc(userId);
  const now = Date.now();

  try {
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);

      if (!doc.exists) {
        // First request
        tx.set(ref, {
          count: 1,
          windowStart: Timestamp.fromMillis(now),
        });
        return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
      }

      const { count, windowStart } = doc.data();
      const windowStartMs = windowStart.toMillis();

      // Window expired — reset
      if (now - windowStartMs > WINDOW_MS) {
        tx.set(ref, {
          count: 1,
          windowStart: Timestamp.fromMillis(now),
        });
        return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
      }

      // Within window
      if (count >= MAX_REQUESTS) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: windowStartMs + WINDOW_MS,
        };
      }

      tx.update(ref, { count: FieldValue.increment(1) });
      return {
        allowed: true,
        remaining: MAX_REQUESTS - count - 1,
        resetAt: windowStartMs + WINDOW_MS,
      };
    });

    return result;
  } catch {
    // On transaction failure, allow the request (fail open — don't block users)
    return { allowed: true, remaining: 1, resetAt: now + WINDOW_MS };
  }
}

module.exports = { checkRateLimit };
