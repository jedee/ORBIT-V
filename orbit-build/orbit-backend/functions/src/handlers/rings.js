/**
 * Rings / Habit Check-In Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads the user's live ring data from Firestore and returns a
 * human-readable daily summary with streak info.
 *
 * Firestore structure written by the frontend:
 *   users/{uid}/rings/{YYYY-MM-DD}  — daily ring completions
 *   users/{uid}                     — streak, totalPerfect, goals
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getFirestore } = require('firebase-admin/firestore');
const R = require('../engine/responseBuilder');

const RING_ICONS = {
  finance: '💰', health: '🏃', mind: '🧠',
  connect: '❤️', growth: '🌱', custom: '⭐',
};

function pctBar(pct) {
  const filled = Math.round((pct / 100) * 8);
  return '█'.repeat(filled) + '░'.repeat(8 - filled);
}

/**
 * @param {object} data
 * @param {string} data.userId
 * @returns {Promise<OrbitResponse>}
 */
async function run({ userId }) {
  const db = getFirestore();
  const todayKey = new Date().toISOString().slice(0, 10);

  // Fetch user profile + today's ring data in parallel
  const [userDoc, todayDoc] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('users').doc(userId).collection('rings').doc(todayKey).get(),
  ]);

  // No linked account yet
  if (!userDoc.exists) {
    return R.question(
      "I don't have your ring data yet. Have you linked your Orbit account?",
      ['Link account', 'Help'],
    );
  }

  const user = userDoc.data();
  const todayRings = todayDoc.exists ? todayDoc.data() : {};
  const goals = user.goals || [];
  const pinnedGoals = goals.filter((g) => g.pinned && g.active !== false);

  // No goals set up
  if (!pinnedGoals.length) {
    return R.text(
      "You haven't pinned any rings yet. Open the app → Today tab → Customise to choose which rings to track.",
    );
  }

  // Build summary
  const lines = [`◎ *Your rings today — ${todayKey}*`, ''];
  let allDone = true;

  for (const goal of pinnedGoals) {
    const progress = todayRings[goal.id] ?? goal.todayP ?? 0;
    const pct = Math.min(Math.round((progress / Math.max(goal.dailyT, 1)) * 100), 100);
    const done = pct >= 100;
    if (!done) allDone = false;

    const icon = RING_ICONS[goal.category] || '⭐';
    const status = done ? '✅' : pct > 0 ? '🔄' : '⭕';
    lines.push(`${status} ${icon} ${goal.label}`);
    lines.push(`   ${pctBar(pct)} ${pct}%  (${progress}/${goal.dailyT} ${goal.unit})`);
  }

  lines.push('');

  if (allDone) {
    lines.push('🎉 *Perfect day! All rings closed.*');
  } else {
    const done = pinnedGoals.filter((g) => {
      const p = todayRings[g.id] ?? g.todayP ?? 0;
      return p >= g.dailyT;
    }).length;
    lines.push(`${done}/${pinnedGoals.length} rings closed today.`);
  }

  // Streak
  const streak = user.streak || 0;
  const totalPerfect = user.totalPerfect || 0;
  if (streak > 0) lines.push(`🔥 ${streak}-day streak · ${totalPerfect} perfect days total`);

  lines.push('', '_Tap + in the app to log progress._');

  return R.result(lines.join('\n'), {
    type: 'ringCheckin',
    todayKey,
    goals: pinnedGoals.map((g) => ({
      id: g.id,
      label: g.label,
      category: g.category,
      pct: Math.min(
        Math.round(((todayRings[g.id] ?? g.todayP ?? 0) / Math.max(g.dailyT, 1)) * 100),
        100,
      ),
    })),
    streak,
    totalPerfect,
    allDone,
  });
}

module.exports = { run };
