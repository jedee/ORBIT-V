/**
 * Orbit Response Builder
 * ─────────────────────────────────────────────────────────────────────────────
 * All responses pass through here so the format is always consistent.
 * Separates content from transport — the in-app provider renders these,
 * and future providers (WhatsApp, SMS) will format them differently.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} OrbitResponse
 * @property {'text'|'list'|'error'|'question'} type
 * @property {string}   message   - Plain text content
 * @property {object}   [data]    - Structured data (for rich in-app rendering)
 * @property {boolean}  [done]    - True when a flow is complete
 * @property {string[]} [options] - Quick-reply options for the user
 */

/** Build a plain text reply */
function text(message, data = {}) {
  return { type: 'text', message, data, done: false };
}

/** Build a question that expects a follow-up */
function question(message, options = [], data = {}) {
  return { type: 'question', message, options, data, done: false };
}

/** Build a final result reply — marks the flow as complete */
function result(message, data = {}) {
  return { type: 'text', message, data, done: true };
}

/** Build an error reply */
function error(message, code = 'UNKNOWN_ERROR') {
  return { type: 'error', message, data: { code }, done: true };
}

/** Build an unknown-intent reply with a nudge */
function unknown() {
  return question(
    "I didn't catch that. Here's what I can do:",
    ['Calculate my tax', 'Check my rings', 'Show leaderboard', 'Link account'],
    { showHelp: true },
  );
}

module.exports = { text, question, result, error, unknown };
