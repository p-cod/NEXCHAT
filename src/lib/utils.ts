import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return format(date, "HH:mm");
}

export function formatChatTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd/MM/yy");
}

export function formatLastSeen(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return "Offline";
  return `Last seen ${formatDistanceToNow(timestamp.toDate(), { addSuffix: true })}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getChatName(
  chat: { type: string; name?: string; participantDetails: Record<string, { displayName: string }> },
  currentUserId: string
): string {
  if (chat.type === "group") return chat.name || "Group Chat";
  const otherUid = Object.keys(chat.participantDetails).find((uid) => uid !== currentUserId);
  if (!otherUid) return "Unknown";
  return chat.participantDetails[otherUid]?.displayName || "Unknown";
}

export function getChatAvatar(
  chat: { type: string; participantDetails: Record<string, { displayName: string; photoURL?: string }> },
  currentUserId: string
): { name: string; photoURL?: string } {
  if (chat.type === "group") {
    return { name: "Group" };
  }
  const otherUid = Object.keys(chat.participantDetails).find((uid) => uid !== currentUserId);
  if (!otherUid) return { name: "?" };
  const details = chat.participantDetails[otherUid];
  return { name: details?.displayName || "?", photoURL: details?.photoURL };
}

export function generateChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}
