# NexChat — Real-Time Chat PWA

Full-stack real-time chat app built with Next.js 14, Firebase, and Tailwind CSS. Supports private DMs, group chats, online status, read receipts, dark/light mode, and installs as a PWA.

---

## Project Structure

```
nexchat/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons (see Icon Setup below)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + PWA meta
│   │   ├── page.tsx           # Main page (auth gate + chat layout)
│   │   └── globals.css        # Tailwind + custom styles
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.tsx   # Login + Register form
│   │   ├── chat/
│   │   │   ├── ChatListItem.tsx    # Sidebar chat row
│   │   │   ├── ChatWindow.tsx      # Main message view
│   │   │   ├── EmptyState.tsx      # No chat selected state
│   │   │   ├── MessageBubble.tsx   # Individual message
│   │   │   ├── NewChatModal.tsx    # Start DM modal
│   │   │   └── NewGroupModal.tsx   # Create group modal
│   │   ├── layout/
│   │   │   └── Sidebar.tsx    # Left sidebar with chat list
│   │   └── ui/
│   │       ├── Avatar.tsx     # User avatar with online dot
│   │       ├── Button.tsx     # Reusable button
│   │       └── Input.tsx      # Reusable input field
│   ├── hooks/
│   │   ├── useAuth.ts         # Auth state listener
│   │   ├── useChats.ts        # Real-time chats subscription
│   │   └── useMessages.ts     # Real-time messages + read marking
│   ├── lib/
│   │   ├── firebase.ts        # Firebase init + offline persistence
│   │   ├── services.ts        # All Firestore/Auth operations
│   │   └── utils.ts           # Helpers (format time, get initials, etc.)
│   ├── store/
│   │   └── index.ts           # Zustand global state
│   └── types/
│       └── index.ts           # TypeScript types
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Required composite indexes
├── firebase.json              # Firebase project config
├── next.config.js             # Next.js + PWA config
├── tailwind.config.js
└── .env.local.example
```

---

## Firebase Setup

### Step 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → Name it (e.g. `nexchat-prod`) → Continue
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Authentication

1. In Firebase Console: **Build → Authentication → Get started**
2. Click **Email/Password** → Enable it → Save

### Step 3 — Create Firestore Database

1. **Build → Firestore Database → Create database**
2. Choose **Production mode** (rules are set in firestore.rules)
3. Pick a server location close to your users (e.g. `europe-west1` for Nigeria latency)

### Step 4 — Get Firebase Config Keys

1. Go to **Project Settings (gear icon) → General**
2. Scroll to **Your apps** → Click **</>** (Web app)
3. Register app (name it `nexchat-web`) → Copy the config object

### Step 5 — Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nexchat-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nexchat-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nexchat-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 6 — Deploy Firestore Rules and Indexes

Install Firebase CLI (do this once):
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # Select your project, use existing rules file
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

> ⚠️ The indexes may take 5–10 minutes to build. Queries will fail until they're ready.

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000 in your browser.

> Note: PWA service worker is disabled in development mode (only active in production build).

---

## Icon Setup (Required for PWA Install)

You need icon files in `public/icons/` at these sizes:
`72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512`

**Quick option — generate from one image:**
1. Create a 512x512 PNG of your logo
2. Use https://www.pwabuilder.com/imageGenerator or https://realfavicongenerator.net
3. Download and place icons in `public/icons/`

**Or use a script:**
```bash
npm install -g sharp-cli
# Then for each size:
sharp -i logo.png -o public/icons/icon-192x192.png resize 192 192
```

---

## Deployment — Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/nexchat.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add Environment Variables: paste all your `NEXT_PUBLIC_FIREBASE_*` values from `.env.local`
5. Click **Deploy**

### Step 3 — Update Firebase Auth Domain

After deploying, add your Vercel URL to Firebase allowed domains:
1. **Firebase Console → Authentication → Settings → Authorized domains**
2. Add your Vercel URL: `nexchat-xyz.vercel.app`

---

## PWA Installation

### Desktop (Chrome)
After deploying, open your Vercel URL in Chrome. You'll see an **Install** button in the address bar. Click it to install as a desktop app.

### Android (Chrome)
Open the URL in Chrome → tap the **⋮ menu → Add to Home screen**. The app installs as a standalone app (no browser chrome).

### iOS (Safari)
Safari doesn't support the full PWA install flow. Users tap **Share → Add to Home Screen**.

---

## Database Schema

```
users/{uid}
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  isOnline: boolean
  lastSeen: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp

chats/{chatId}
  id: string
  type: "direct" | "group"
  participants: string[]         # array of uids
  participantDetails: {
    [uid]: { displayName, photoURL }
  }
  lastMessage: {
    text: string
    senderId: string
    createdAt: Timestamp
  } | null
  createdAt: Timestamp
  updatedAt: Timestamp
  # Group only:
  name: string
  description: string
  createdBy: string
  adminIds: string[]

chats/{chatId}/messages/{messageId}
  id: string
  chatId: string
  senderId: string
  senderName: string
  text: string
  type: "text"
  readBy: string[]               # uids who have read
  createdAt: Timestamp
```

---

## Features Implemented

| Feature | Status |
|---|---|
| Email/password auth | ✅ |
| Register + Login + Logout | ✅ |
| Private 1-to-1 DMs | ✅ |
| Group chats (create + join via invite flow) | ✅ |
| Real-time messages (no refresh needed) | ✅ |
| Online/offline status | ✅ |
| Message timestamps | ✅ |
| Read receipts (✓✓ ticks) | ✅ |
| Unread message count badges | ✅ |
| Mobile-first responsive UI | ✅ |
| Dark/light mode toggle | ✅ |
| PWA manifest + service worker | ✅ |
| Offline UI caching | ✅ |
| Add to Home Screen | ✅ |
| Firestore offline persistence | ✅ |
| Secure Firestore rules | ✅ |
| User search | ✅ |

---

## Scaling Notes (100–150 users)

The current setup is well within Firebase's free tier (Spark plan):
- **Reads**: 50,000/day free
- **Writes**: 20,000/day free
- **Stored data**: 1 GB free

When you grow past free tier, upgrade to **Blaze (pay-as-you-go)** — at 150 active users the cost is typically < $5/month.

**Performance tips already baked in:**
- Messages limited to last 100 per chat (add pagination for older messages)
- Indexed queries for fast sorting
- Offline persistence via IndexedDB
- Service worker caches static assets

---

## Known Limitations / Future Improvements

- No image/file uploads (add Firebase Storage for this)
- No push notifications (add FCM for background alerts)
- No message deletion or editing
- Group member management (add/remove) not in UI yet
- No end-to-end encryption

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Authentication |
| Real-time | Firestore onSnapshot listeners |
| PWA | next-pwa (Workbox) |
| Hosting | Vercel (frontend) |
| Icons | Lucide React |
