import { cn, formatChatTime, getChatName, getChatAvatar } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Chat, Message } from "@/types";

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  isActive: boolean;
  messages: Message[];
  onClick: () => void;
}

export function ChatListItem({ chat, currentUserId, isActive, messages, onClick }: ChatListItemProps) {
  const name = getChatName(chat, currentUserId);
  const avatar = getChatAvatar(chat, currentUserId);

  // Count unread
  const unreadCount = messages.filter(
    (m) => m.senderId !== currentUserId && !m.readBy.includes(currentUserId)
  ).length;

  const lastMsg = chat.lastMessage;
  const lastText = lastMsg
    ? lastMsg.senderId === currentUserId
      ? `You: ${lastMsg.text}`
      : lastMsg.text
    : "No messages yet";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150",
        isActive
          ? "bg-brand-500/10 dark:bg-brand-500/15"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
      )}
    >
      <Avatar
        name={avatar.name}
        photoURL={avatar.photoURL}
        size="md"
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-sm font-semibold truncate", isActive ? "text-brand-600 dark:text-brand-400" : "text-zinc-900 dark:text-zinc-100")}>
            {name}
          </span>
          {lastMsg && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">
              {formatChatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{lastText}</p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
