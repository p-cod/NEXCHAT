"use client";
import { useState, useRef } from "react";
import { cn, formatMessageTime } from "@/lib/utils";
import type { Message } from "@/types";
import { Check, CheckCheck, Reply, Pencil, Trash2 } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName: boolean;
  totalParticipants: number;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSenderName,
  totalParticipants,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const isRead = message.readBy.length >= totalParticipants;
  const isDeleted = message.deleted;

  // Swipe to reply
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swipeTriggered = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleted) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeTriggered.current = false;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || isDeleted) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Only allow horizontal swipe right, and not if vertical scroll
    if (dy > 10) { setSwipeX(0); return; }
    if (dx > 0 && dx < 80) setSwipeX(dx);
    if (dx >= 60 && !swipeTriggered.current) {
      swipeTriggered.current = true;
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  const handleTouchEnd = () => {
    if (swipeTriggered.current && !isDeleted) {
      onReply(message);
    }
    setSwipeX(0);
    setSwiping(false);
  };

  // Long press for edit/delete menu
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = () => {
    if (isDeleted) return;
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(40);
      setShowMenu(true);
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div
      className={cn("flex mb-1 animate-fade-in relative", isOwn ? "justify-end" : "justify-start")}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reply icon appears while swiping */}
      {swipeX > 20 && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-400 transition-opacity"
          style={{ opacity: swipeX / 60 }}
        >
          <Reply className="w-5 h-5" />
        </div>
      )}

      {/* Bubble */}
      <div
        style={{ transform: `translateX(${swipeX}px)`, transition: swipeX === 0 ? "transform 0.2s ease" : "none" }}
        className="max-w-[75%]"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={(e) => { handlePressEnd(); handleTouchEnd(); }}
      >
        {/* Reply preview */}
        {message.replyTo && !isDeleted && (
          <div
            className={cn(
              "text-xs rounded-lg px-2.5 py-1.5 mb-1 border-l-2 border-brand-400",
              isOwn
                ? "bg-brand-600/40 text-brand-100"
                : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
            )}
          >
            <p className="font-semibold text-brand-400 truncate">{message.replyTo.senderName}</p>
            <p className="truncate">{message.replyTo.text}</p>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 shadow-sm",
            isOwn
              ? "bg-brand-500 text-white rounded-br-sm"
              : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm border border-zinc-100 dark:border-zinc-700",
            isDeleted && "opacity-60"
          )}
        >
          {showSenderName && !isOwn && (
            <p className="text-[11px] font-semibold text-brand-500 mb-0.5">{message.senderName}</p>
          )}

          <p className={cn("text-sm leading-relaxed break-words whitespace-pre-wrap", isDeleted && "italic")}>
            {message.text}
          </p>

          <div className={cn("flex items-center gap-1 mt-0.5", isOwn ? "justify-end" : "justify-start")}>
            {message.edited && !isDeleted && (
              <span className={cn("text-[10px]", isOwn ? "text-brand-200" : "text-zinc-400")}>edited</span>
            )}
            <span className={cn("text-[10px]", isOwn ? "text-brand-100" : "text-zinc-400 dark:text-zinc-500")}>
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && !isDeleted && (
              isRead ? (
                <CheckCheck className="w-3 h-3 text-brand-100" />
              ) : (
                <Check className="w-3 h-3 text-brand-200" />
              )
            )}
          </div>
        </div>
      </div>

      {/* Long press context menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div
            className={cn(
              "absolute z-50 bottom-full mb-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-slide-up",
              isOwn ? "right-0" : "left-0"
            )}
          >
            <button
              onClick={() => { onReply(message); setShowMenu(false); }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 w-full text-left"
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
            {isOwn && !isDeleted && (
              <>
                <button
                  onClick={() => { onEdit(message); setShowMenu(false); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 w-full text-left"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => { onDelete(message); setShowMenu(false); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
