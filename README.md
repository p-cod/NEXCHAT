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
