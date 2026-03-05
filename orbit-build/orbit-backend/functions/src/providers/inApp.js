/**
 * In-App Provider
 * ─────────────────────────────────────────────────────────────────────────────
 * The first (and currently only) provider for Orbit.
 *
 * Firebase Callable Functions are invoked directly from the frontend.
 * Auth is handled automatically — no webhook, no signature verification needed.
 *
 * This module normalises the callable request data into Orbit's
 * internal message format so the engine never needs to know about
 * the transport layer.
 *
 * When WhatsApp/SMS support is added later, those providers will
 * implement the same normalise() interface.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Normalises an in-app callable request into Orbit's message format.
 *
 * @param {object} data   - Callable function request data
 * @param {object} auth   - Firebase auth context (from the callable)
 * @returns {{ userId, text, channel, context }}
 */
function normalise(data, auth) {
  if (!auth?.uid) {
    throw new Error('UNAUTHENTICATED');
  }

  const text = (data?.message || data?.text || '').toString().trim().slice(0, 1000);

  return {
    userId:  auth.uid,
    text,
    channel: 'in-app',
    context: {
      uid:         auth.uid,
      displayName: auth.token?.name || null,
      email:       auth.token?.email || null,
    },
  };
}

module.exports = { normalise };
