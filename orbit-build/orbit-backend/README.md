# Orbit Backend — Firebase Cloud Functions

Conversation engine, live leaderboard, friend sync, and tax calculator — all on Firebase.

---

## Architecture

```
Frontend (App.jsx)
      │
      │  Firebase Callable Functions (authenticated, in-app)
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloud Functions                              │
│                                                                 │
│  conversationMessage ──► In-App Provider                        │
│                               │                                 │
│                          Rate Limiter ──► block if >30/min      │
│                               │                                 │
│                          Deduplicator ──► drop if seen <30s     │
│                               │                                 │
│                          Flow Engine                            │
│                          ┌────┴──────────────────────────────┐  │
│                          │  Intent Detector                  │  │
│                          │  Conversation State (Firestore)   │  │
│                          │  Multi-step Flow Runner           │  │
│                          └────┬──────────────────────────────┘  │
│                               │                                 │
│                    ┌──────────┼──────────┬──────────┐           │
│                    ▼          ▼          ▼          ▼           │
│               Tax Handler  Account    Rings    Leaderboard       │
│                    │        Link      Handler    Handler         │
│                    ▼          ▼          ▼          ▼           │
│               Tax Engine   Firestore  Firestore  Firestore       │
│               (pure fn)    users/     users/     users/ +        │
│                            orbitIds   rings/     friends/        │
└─────────────────────────────────────────────────────────────────┘
                               │
                          Firestore
```

---

## Project Structure

```
orbit-backend/
├── functions/
│   ├── src/
│   │   ├── index.js                  ← All exported Cloud Functions
│   │   ├── engine/
│   │   │   ├── intentDetector.js     ← Text → intent routing
│   │   │   ├── conversationState.js  ← Firestore session store (TTL 10min)
│   │   │   ├── flowEngine.js         ← Multi-step flow orchestrator
│   │   │   └── responseBuilder.js    ← Consistent response format
│   │   ├── handlers/
│   │   │   ├── tax.js                ← PAYE calculation handler
│   │   │   ├── accountLink.js        ← Orbit ID linking
│   │   │   ├── rings.js              ← Daily ring check-in
│   │   │   └── leaderboard.js        ← Friend rankings
│   │   ├── logic/
│   │   │   └── taxEngine.js          ← Pure PITA/PRA/NHF tax logic
│   │   ├── middleware/
│   │   │   ├── rateLimit.js          ← 30 req/min per user
│   │   │   └── dedup.js              ← 30-second hash dedup
│   │   └── providers/
│   │       └── inApp.js              ← In-app provider normaliser
│   └── __tests__/
│       └── engine.test.js            ← Unit tests (tax + intent)
├── firestore.rules                   ← Security rules (privacy enforced)
├── firestore.indexes.json            ← Composite indexes
├── firebase.json                     ← Firebase project config
├── .firebaserc                       ← Project aliases
├── src-firebase.js                   ← Drop into orbit-build/src/firebase.js
└── .github/workflows/
    └── firebase-deploy.yml           ← CI/CD: test → build → deploy
```

---

## Firestore Data Model

```
users/{uid}
  displayName: string
  orbitId: string
  streak: number
  totalPerfect: number
  todayPct: number
  goals: array
  updatedAt: timestamp

  /rings/{YYYY-MM-DD}         ← daily ring snapshots
    {goalId}: number          ← progress per goal

  /friends/{friendUid}        ← friend list
    addedAt: timestamp
    orbitId: string

orbitIds/{ORBIT-XXXXXX}       ← reverse lookup
  uid: string

conversations/{uid}           ← active conversation sessions
  intent: string
  step: number
  data: object
  expiresAt: timestamp        ← auto-cleans hourly

rateLimits/{uid}              ← rate limit counters
messageHashes/{hash}          ← dedup hashes (30-second window)
```

---

## Day-One Setup

### 1. Create Firebase projects

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Create two projects (free Spark plan is enough to start)
# Console → Add project → "orbit-prod"
# Console → Add project → "orbit-staging"
```

### 2. Enable services (both projects)

In the Firebase Console for each project:
- **Authentication** → Sign-in method → **Anonymous** → Enable
- **Firestore** → Create database → Start in **production mode**
- **Functions** → Get started (requires Blaze plan for outbound calls)

### 3. Get a CI deploy token

```bash
firebase login:ci
# Copy the token → GitHub repo → Settings → Secrets → FIREBASE_TOKEN
```

### 4. Update .firebaserc

Replace `orbit-prod` and `orbit-staging` with your actual project IDs.

### 5. Deploy

```bash
cd orbit-backend
firebase use production
cd functions && npm install && cd ..
firebase deploy --only functions,firestore
```

Or just push to `main` — the GitHub Actions workflow handles it.

---

## Integrating the Frontend

1. Copy `src-firebase.js` → `orbit-build/src/firebase.js`
2. Fill in your Firebase config from the Console
3. `npm install firebase` in orbit-build/

Then in App.jsx, replace the MOCK_FRIENDS leaderboard with:

```jsx
import { getLeaderboard, addFriend, syncStats } from './firebase.js';

// In FriendsTab — replace MOCK_FRIENDS fetch:
useEffect(() => {
  getLeaderboard().then(({ friends }) => setFriends(friends)).catch(console.error);
}, []);

// Replace the "Add friend" button action:
const handleAddFriend = async (orbitId) => {
  const friend = await addFriend(orbitId);
  setFriends(prev => [...prev, friend]);
};
```

And sync stats whenever they change:

```jsx
// In Dashboard, add a useEffect watching stats:
useEffect(() => {
  if (!loaded) return;
  syncStats({ streak: stats.streak, totalPerfect: stats.total, todayPct: myTodayPct, goals, todayKey: todayKey() })
    .catch(console.error);
}, [stats, goals]);
```

---

## Running Locally

```bash
cd functions && npm install && cd ..
firebase emulators:start --only functions,firestore
# → Functions:  http://localhost:5001
# → Firestore:  http://localhost:8080
# → Emulator UI: http://localhost:4000
```

---

## Privacy Design

The Firestore security rules enforce what the conversation engine also enforces:

- Friends only ever see: `streak`, `totalPerfect`, `todayPct`, `name`, `orbitId`
- Income, budget lines, and spending data are **never stored in Firestore**
- They stay on-device in localStorage only
- The backend never touches financial data except to run the tax calculation (which is stateless — input in, output out, nothing stored)
