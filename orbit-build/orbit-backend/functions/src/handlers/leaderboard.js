/**
 * Friend Leaderboard Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches the user's friends from Firestore and builds a ranked leaderboard.
 *
 * Firestore structure:
 *   users/{uid}                          — user public stats
 *   users/{uid}/friends/{friendUid}      — friend list
 *
 * Privacy rule (enforced in Firestore security rules too):
 *   Friends only see: name, streak, totalPerfect, todayPct, orbitId
 *   Friends NEVER see: income, budget, spending data
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getFirestore } = require('firebase-admin/firestore');
const R = require('../engine/responseBuilder');

const MEDALS = ['🥇', '🥈', '🥉'];

const LEVELS = [
  { min: 0,   name: 'Starting',    icon: '🌱' },
  { min: 3,   name: 'Building',    icon: '🔥' },
  { min: 10,  name: 'Consistent',  icon: '⚡' },
  { min: 30,  name: 'Committed',   icon: '💎' },
  { min: 60,  name: 'Disciplined', icon: '🏆' },
  { min: 100, name: 'Legend',      icon: '⭐' },
];

function getLevel(totalPerfect) {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (totalPerfect >= l.min) lv = l;
  return lv;
}

/**
 * @param {object} data
 * @param {string} data.userId
 * @returns {Promise<OrbitResponse>}
 */
async function run({ userId }) {
  const db = getFirestore();

  // Fetch own profile
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return R.question(
      "Link your account first to see the leaderboard.",
      ['Link account'],
    );
  }

  const me = { uid: userId, ...userDoc.data(), isMe: true };

  // Fetch friend UIDs
  const friendSnap = await db
    .collection('users')
    .doc(userId)
    .collection('friends')
    .limit(50)
    .get();

  const friendUids = friendSnap.docs.map((d) => d.id);

  // Fetch friend profiles in parallel (public fields only)
  const friendDocs = await Promise.all(
    friendUids.map((uid) => db.collection('users').doc(uid).get()),
  );

  const friends = friendDocs
    .filter((d) => d.exists)
    .map((d) => ({
      uid: d.id,
      // Explicitly pick only public fields — never income/budget
      name:         d.data().displayName || d.data().name || 'Friend',
      orbitId:      d.data().orbitId || '',
      streak:       d.data().streak || 0,
      totalPerfect: d.data().totalPerfect || 0,
      todayPct:     d.data().todayPct || 0,
      isMe:         false,
    }));

  // Combine + rank by streak (tiebreak: totalPerfect)
  const all = [
    {
      uid:          me.uid,
      name:         me.displayName || me.name || 'You',
      orbitId:      me.orbitId || '',
      streak:       me.streak || 0,
      totalPerfect: me.totalPerfect || 0,
      todayPct:     me.todayPct || 0,
      isMe:         true,
    },
    ...friends,
  ].sort((a, b) => b.streak - a.streak || b.totalPerfect - a.totalPerfect);

  if (all.length === 1) {
    return R.result(
      [
        '👥 *Leaderboard*',
        '',
        "You're the only one here so far.",
        'Share your Orbit ID with friends and add theirs to compete.',
        '',
        `Your stats: 🔥 ${me.streak || 0}-day streak · ${me.totalPerfect || 0} perfect days`,
      ].join('\n'),
      { type: 'leaderboard', entries: all },
    );
  }

  const lines = ['👥 *Leaderboard — Ranked by streak*', ''];

  all.forEach((entry, i) => {
    const medal = MEDALS[i] || `${i + 1}.`;
    const lv = getLevel(entry.totalPerfect);
    const tag = entry.isMe ? ' ← you' : '';
    lines.push(`${medal} ${entry.name}${tag}`);
    lines.push(`   ${lv.icon} ${lv.name} · 🔥 ${entry.streak}d · ${entry.totalPerfect} perfect days`);
    lines.push('');
  });

  const myRank = all.findIndex((e) => e.isMe) + 1;
  lines.push(`You are ranked #${myRank} of ${all.length}.`);

  if (myRank > 1) {
    const ahead = all[myRank - 2];
    const gap = ahead.streak - all[myRank - 1].streak;
    if (gap === 0) {
      lines.push(`You're tied with ${ahead.name}. Keep going.`);
    } else {
      lines.push(`${gap} more streak day${gap === 1 ? '' : 's'} to overtake ${ahead.name}.`);
    }
  }

  return R.result(lines.join('\n'), {
    type: 'leaderboard',
    entries: all,
    myRank,
  });
}

module.exports = { run };
