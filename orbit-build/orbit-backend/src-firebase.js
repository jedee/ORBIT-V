/**
 * Orbit — Firebase Integration for the Frontend
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop this file into orbit-build/src/firebase.js
 *
 * Then replace the relevant sections of App.jsx to call live Cloud Functions
 * instead of using MOCK_FRIENDS and local-only logic.
 *
 * Setup:
 *   1. Go to Firebase Console → Project Settings → General → Your Apps → Web
 *   2. Copy your firebaseConfig object into the config below
 *   3. npm install firebase (in orbit-build/)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp }            from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ── Replace with your actual Firebase project config ────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "orbit-prod.firebaseapp.com",
  projectId:         "orbit-prod",
  storageBucket:     "orbit-prod.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// ── Initialise ───────────────────────────────────────────────────────────────
const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const functions = getFunctions(app, 'us-central1');

// ── Anonymous auth ───────────────────────────────────────────────────────────
// Orbit uses anonymous auth so no sign-up friction. Data lives on-device
// and the server only sees the anonymous UID for friend/leaderboard sync.

export function ensureAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then(({ user }) => resolve(user)).catch(reject);
      }
    });
  });
}

// ── Callable function wrappers ───────────────────────────────────────────────

const _conversationMessage = httpsCallable(functions, 'conversationMessage');
const _syncUserStats        = httpsCallable(functions, 'syncUserStats');
const _addFriend            = httpsCallable(functions, 'addFriend');
const _removeFriend         = httpsCallable(functions, 'removeFriend');
const _getLeaderboard       = httpsCallable(functions, 'getLeaderboard');

/**
 * Send a message to the Orbit conversation engine.
 * @param {string} message
 * @returns {Promise<{ type, message, data, done, options }>}
 */
export async function sendMessage(message) {
  await ensureAuth();
  const result = await _conversationMessage({ message });
  return result.data;
}

/**
 * Sync local stats to Firestore (call whenever streak/goals change).
 * @param {{ streak, totalPerfect, todayPct, goals, todayKey }} stats
 */
export async function syncStats(stats) {
  await ensureAuth();
  await _syncUserStats(stats);
}

/**
 * Add a friend by their Orbit ID.
 * @param {string} orbitId  e.g. "ORBIT-A1B2C3"
 * @returns {Promise<FriendProfile>}
 */
export async function addFriend(orbitId) {
  await ensureAuth();
  const result = await _addFriend({ orbitId });
  return result.data;
}

/**
 * Remove a friend.
 * @param {string} friendUid
 */
export async function removeFriend(friendUid) {
  await ensureAuth();
  await _removeFriend({ friendUid });
}

/**
 * Fetch the live leaderboard (replaces MOCK_FRIENDS in App.jsx).
 * @returns {Promise<{ me, friends }>}
 */
export async function getLeaderboard() {
  await ensureAuth();
  const result = await _getLeaderboard({});
  return result.data;
}

export { auth };
