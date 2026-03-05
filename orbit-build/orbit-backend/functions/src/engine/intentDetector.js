/**
 * Orbit Intent Detector
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts raw user text → a structured intent.
 * Designed for Nigerian English patterns and shorthand.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** All supported intents */
const INTENTS = {
  CALCULATE_TAX:  'CALCULATE_TAX',
  ACCOUNT_LINK:   'ACCOUNT_LINK',
  RING_CHECKIN:   'RING_CHECKIN',
  LEADERBOARD:    'LEADERBOARD',
  HELP:           'HELP',
  CANCEL:         'CANCEL',
  UNKNOWN:        'UNKNOWN',
};

/**
 * Detection rules — evaluated top to bottom.
 * Each rule has a test function and a resulting intent.
 */
const RULES = [
  // Cancel / reset — highest priority
  {
    intent: INTENTS.CANCEL,
    test: (t) => /^(cancel|stop|quit|reset|back|nevermind|never mind|start over)$/i.test(t),
  },
  // Help
  {
    intent: INTENTS.HELP,
    test: (t) => /^(help|what can you do|commands|menu|\?)$/i.test(t),
  },
  // Tax / PAYE
  {
    intent: INTENTS.CALCULATE_TAX,
    test: (t) =>
      /\b(tax|paye|income tax|calculate tax|my tax|tax breakdown|salary tax|pita|tax me|how much tax|net salary|take home)\b/i.test(t),
  },
  // Account linking
  {
    intent: INTENTS.ACCOUNT_LINK,
    test: (t) =>
      /\b(link|connect|my orbit id|orbit id|link account|register|sign in|sync|account)\b/i.test(t)
      || /^orbit-[a-z0-9]{6}$/i.test(t.trim()),
  },
  // Ring check-ins
  {
    intent: INTENTS.RING_CHECKIN,
    test: (t) =>
      /\b(rings?|habits?|check[ -]?in|log|today|progress|goals?|streak|my rings|how am i doing|done)\b/i.test(t),
  },
  // Leaderboard
  {
    intent: INTENTS.LEADERBOARD,
    test: (t) =>
      /\b(leaderboard|rank(ing)?|friends?|top|who('s| is) (winning|leading|ahead)|standings?|scores?)\b/i.test(t),
  },
];

/**
 * Detects intent from raw text.
 * @param {string} text
 * @returns {{ intent: string, confidence: 'high'|'low' }}
 */
function detectIntent(text) {
  if (!text || !text.trim()) return { intent: INTENTS.UNKNOWN, confidence: 'low' };

  const normalized = text.trim().toLowerCase();

  for (const rule of RULES) {
    if (rule.test(normalized)) {
      return { intent: rule.intent, confidence: 'high' };
    }
  }

  return { intent: INTENTS.UNKNOWN, confidence: 'low' };
}

/**
 * Help message listing all available commands.
 */
function getHelpText() {
  return [
    '🪐 *Orbit — What I can do:*',
    '',
    '💰 *Tax / PAYE*',
    '   "calculate tax" or "what is my PAYE?"',
    '',
    '🔗 *Link your account*',
    '   "link account" or paste your ORBIT-XXXXXX ID',
    '',
    '◎  *Check your rings*',
    '   "check in" or "show my progress"',
    '',
    '👥 *Leaderboard*',
    '   "leaderboard" or "show rankings"',
    '',
    'Type *cancel* at any time to start over.',
  ].join('\n');
}

module.exports = { detectIntent, getHelpText, INTENTS };
