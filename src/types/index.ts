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

export interface ReplyTo {
  messageId: string;
  text: string;
  senderName: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp;
  readBy: string[];
  type: "text";
  replyTo?: ReplyTo;
  edited?: boolean;
  deleted?: boolean;
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  participants: string[];
  participantDetails: Record<string, { displayName: string; photoURL?: string }>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

