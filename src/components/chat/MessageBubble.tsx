import { cn, formatMessageTime } from "@/lib/utils";
import type { Message } from "@/types";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName: boolean;
  totalParticipants: number;
}

export function MessageBubble({ message, isOwn, showSenderName, totalParticipants }: MessageBubbleProps) {
  const isRead = message.readBy.length >= totalParticipants;

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start", "mb-1 animate-fade-in")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm",
          isOwn
            ? "bg-brand-500 text-white rounded-br-sm"
            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm border border-zinc-100 dark:border-zinc-700"
        )}
      >
        {showSenderName && !isOwn && (
          <p className="text-[11px] font-semibold text-brand-500 mb-0.5">{message.senderName}</p>
        )}
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
        <div className={cn("flex items-center gap-1 mt-0.5", isOwn ? "justify-end" : "justify-start")}>
          <span className={cn("text-[10px]", isOwn ? "text-brand-100" : "text-zinc-400 dark:text-zinc-500")}>
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="w-3 h-3 text-brand-100" />
            ) : (
              <Check className="w-3 h-3 text-brand-200" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
