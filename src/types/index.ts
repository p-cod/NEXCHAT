import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isOnline: boolean;
  lastSeen: Timestamp;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp;
  readBy: string[]; // array of user uids who have read
  type: "text";
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  participants: string[]; // uid array
  participantDetails: Record<string, { displayName: string; photoURL?: string }>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // group-only fields
  name?: string;
  description?: string;
  createdBy?: string;
  adminIds?: string[];
}

export type Theme = "light" | "dark";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
