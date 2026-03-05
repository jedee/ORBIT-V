/**
 * Orbit Flow Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates multi-step conversations.
 *
 * Each intent maps to a FLOW — an ordered list of steps.
 * Each step either:
 *   - asks a question and waits for input (type: 'ask')
 *   - validates and stores input (type: 'store')
 *   - executes a handler and returns a result (type: 'process')
 *
 * The engine:
 *   1. Checks if a flow is already in progress
 *   2. If yes — feeds the message to the current step
 *   3. If no — detects intent and starts a new flow
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { detectIntent, getHelpText, INTENTS } = require('./intentDetector');
const { getState, startFlow, advanceStep, clearState } = require('./conversationState');
const R = require('./responseBuilder');

const taxHandler        = require('../handlers/tax');
const accountLinkHandler = require('../handlers/accountLink');
const ringsHandler      = require('../handlers/rings');
const leaderboardHandler = require('../handlers/leaderboard');

// ── Flow definitions ────────────────────────────────────────────────────────
// Each step: { ask?, key?, validate?, options?, process? }

const FLOWS = {
  [INTENTS.CALCULATE_TAX]: [
    {
      ask: "What is your monthly gross salary? (e.g. ₦350,000 or 350k)",
      key: 'monthlyGross',
      validate: 'currency',
    },
    {
      ask: "What best describes your employment?",
      key: 'employmentType',
      validate: 'option',
      options: [
        { label: 'Salaried employee',   value: 'salary'     },
        { label: 'Business owner',      value: 'business'   },
        { label: 'NYSC Corper',         value: 'corper'     },
        { label: 'Freelancer',          value: 'freelancer' },
      ],
    },
    { process: taxHandler.run },
  ],

  [INTENTS.ACCOUNT_LINK]: [
    {
      ask: "What is your Orbit ID? You'll find it in the Friends tab. (format: ORBIT-XXXXXX)",
      key: 'orbitId',
      validate: 'orbitId',
    },
    { process: accountLinkHandler.run },
  ],

  [INTENTS.RING_CHECKIN]: [
    // No questions needed — fetches live data immediately
    { process: ringsHandler.run },
  ],

  [INTENTS.LEADERBOARD]: [
    // No questions needed — fetches live data immediately
    { process: leaderboardHandler.run },
  ],
};

// ── Validators ──────────────────────────────────────────────────────────────

const { parseCurrency } = require('../logic/taxEngine');

function validate(type, value, step) {
  switch (type) {
    case 'currency': {
      const n = parseCurrency(value);
      if (!n || n < 1000) return { ok: false, msg: "That doesn't look right. Please enter your monthly salary (e.g. ₦120,000 or 120k)." };
      if (n > 100_000_000) return { ok: false, msg: "That's unusually high. Double-check and try again." };
      return { ok: true, parsed: n };
    }
    case 'option': {
      const opts = step.options;
      // Accept label or value match (case-insensitive)
      const match = opts.find(
        (o) => o.value.toLowerCase() === value.toLowerCase()
          || o.label.toLowerCase().includes(value.toLowerCase())
          || String(opts.indexOf(o) + 1) === value.trim()
      );
      if (!match) {
        const list = opts.map((o, i) => `  ${i + 1}. ${o.label}`).join('\n');
        return { ok: false, msg: `Please choose one:\n${list}` };
      }
      return { ok: true, parsed: match.value };
    }
    case 'orbitId': {
      const clean = value.trim().toUpperCase();
      if (!/^ORBIT-[A-Z0-9]{6}$/.test(clean)) {
        return { ok: false, msg: "That doesn't look like a valid Orbit ID. It should look like ORBIT-A1B2C3. Check the Friends tab." };
      }
      return { ok: true, parsed: clean };
    }
    default:
      return { ok: true, parsed: value };
  }
}

// ── Main engine entry point ─────────────────────────────────────────────────

/**
 * Process a single inbound message from a user.
 *
 * @param {string} userId   - Authenticated Firebase UID
 * @param {string} text     - Raw message text
 * @param {object} context  - { uid, orbitId?, displayName? }
 * @returns {Promise<OrbitResponse>}
 */
async function processMessage(userId, text, context = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) return R.unknown();

  // Always handle cancel first
  const { intent: rawIntent } = require('./intentDetector').detectIntent(trimmed);
  if (rawIntent === INTENTS.CANCEL) {
    await clearState(userId);
    return R.text('Cancelled. What would you like to do?\n\n' + getHelpText(), { showHelp: true });
  }

  if (rawIntent === INTENTS.HELP) {
    await clearState(userId);
    return R.text(getHelpText(), { showHelp: true });
  }

  // Check for in-progress flow
  const state = await getState(userId);

  // ── Continuing an existing flow ─────────────────────────────────────────
  if (state) {
    const flow = FLOWS[state.intent];
    if (!flow) {
      await clearState(userId);
      return R.unknown();
    }

    const currentStep = flow[state.step];

    // Process step (final handler)
    if (currentStep.process) {
      try {
        const response = await currentStep.process({ ...state.data, userId, context });
        await clearState(userId);
        return response;
      } catch (err) {
        await clearState(userId);
        return R.error('Something went wrong. Please try again.', err.code || 'HANDLER_ERROR');
      }
    }

    // Validate input
    if (currentStep.validate) {
      const validation = validate(currentStep.validate, trimmed, currentStep);
      if (!validation.ok) {
        return R.question(validation.msg, currentStep.options?.map(o => o.label) || []);
      }
      // Store parsed value and advance
      const newData = { ...state.data, [currentStep.key]: validation.parsed };
      await advanceStep(userId, newData);

      // Check if next step is a processor
      const nextStep = flow[state.step + 1];
      if (nextStep?.process) {
        try {
          const response = await nextStep.process({ ...newData, userId, context });
          await clearState(userId);
          return response;
        } catch (err) {
          await clearState(userId);
          return R.error('Something went wrong. Please try again.', err.code || 'HANDLER_ERROR');
        }
      }

      // Ask next question
      if (nextStep?.ask) {
        return R.question(nextStep.ask, nextStep.options?.map(o => o.label) || []);
      }
    }

    await clearState(userId);
    return R.unknown();
  }

  // ── Starting a new flow ─────────────────────────────────────────────────
  const { intent } = detectIntent(trimmed);
  const flow = FLOWS[intent];

  if (!flow) return R.unknown();

  await startFlow(userId, intent);
  const firstStep = flow[0];

  // Single-step flows (no questions)
  if (firstStep.process) {
    try {
      const response = await firstStep.process({ userId, context });
      await clearState(userId);
      return response;
    } catch (err) {
      await clearState(userId);
      return R.error('Something went wrong. Please try again.');
    }
  }

  return R.question(firstStep.ask, firstStep.options?.map(o => o.label) || []);
}

module.exports = { processMessage };
