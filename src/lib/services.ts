import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, Chat, Message } from "@/types";
import { generateChatId } from "./utils";

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function registerUser(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    email,
    displayName,
    photoURL: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isOnline: true,
    lastSeen: serverTimestamp(),
  });
  return credential.user;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await updateDoc(doc(db, "users", credential.user.uid), {
    isOnline: true,
    lastSeen: serverTimestamp(),
  });
  return credential.user;
}

export async function signOut() {
  if (auth.currentUser) {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
  }
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function searchUsers(searchQuery: string, currentUserId: string): Promise<User[]> {
  const q = query(
    collection(db, "users"),
    where("displayName", ">=", searchQuery),
    where("displayName", "<=", searchQuery + "\uf8ff"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as User)
    .filter((u) => u.uid !== currentUserId);
}

export function subscribeToUser(uid: string, callback: (user: User | null) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    callback(snap.exists() ? (snap.data() as User) : null);
  });
}

export async function setUserOnline(uid: string, isOnline: boolean) {
  await updateDoc(doc(db, "users", uid), {
    isOnline,
    lastSeen: serverTimestamp(),
  });
}

// ─── CHATS ───────────────────────────────────────────────────────────────────

export async function getOrCreateDirectChat(currentUser: User, targetUser: User): Promise<string> {
  const chatId = generateChatId(currentUser.uid, targetUser.uid);
  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      id: chatId,
      type: "direct",
      participants: [currentUser.uid, targetUser.uid],
      participantDetails: {
        [currentUser.uid]: { displayName: currentUser.displayName, photoURL: currentUser.photoURL || null },
        [targetUser.uid]: { displayName: targetUser.displayName, photoURL: targetUser.photoURL || null },
      },
      lastMessage: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return chatId;
}

export async function createGroupChat(
  currentUser: User,
  groupName: string,
  memberUids: string[],
  memberDetails: Record<string, { displayName: string; photoURL?: string }>
): Promise<string> {
  const allParticipants = [currentUser.uid, ...memberUids];
  const allDetails = {
    [currentUser.uid]: { displayName: currentUser.displayName, photoURL: currentUser.photoURL || null },
    ...memberDetails,
  };

  const chatRef = await addDoc(collection(db, "chats"), {
    type: "group",
    name: groupName,
    description: "",
    participants: allParticipants,
    participantDetails: allDetails,
    adminIds: [currentUser.uid],
    createdBy: currentUser.uid,
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return chatRef.id;
}

export function subscribeToChats(uid: string, callback: (chats: Chat[]) => void) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat));
    callback(chats);
  });
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export async function sendMessage(
  chatId: string,
  sender: User,
  text: string
): Promise<void> {
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, "chats", chatId, "messages"));
  const now = serverTimestamp();

  batch.set(msgRef, {
    id: msgRef.id,
    chatId,
    senderId: sender.uid,
    senderName: sender.displayName,
    text: text.trim(),
    createdAt: now,
    readBy: [sender.uid],
    type: "text",
  });

  batch.update(doc(db, "chats", chatId), {
    lastMessage: {
      text: text.trim(),
      senderId: sender.uid,
      createdAt: now,
    },
    updatedAt: now,
  });

  await batch.commit();
}

export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
    callback(msgs);
  });
}

export async function markMessagesRead(chatId: string, userId: string, messageIds: string[]) {
  if (!messageIds.length) return;
  const batch = writeBatch(db);
  messageIds.forEach((msgId) => {
    batch.update(doc(db, "chats", chatId, "messages", msgId), {
      readBy: arrayUnion(userId),
    });
  });
  await batch.commit();
}
