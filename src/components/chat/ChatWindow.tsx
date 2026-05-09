"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/store";
import { useMessages } from "@/hooks/useMessages";
import { sendMessage, editMessage, deleteMessageForEveryone } from "@/lib/services";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Avatar } from "@/components/ui/Avatar";
import { getChatName, getChatAvatar } from "@/lib/utils";
import { Send, ArrowLeft, Users, Loader2, X, Pencil, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat, Message, ReplyTo } from "@/types";

// ── Notification sound via Web Audio API ─────────────────────────────────────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Audio not available — fail silently
  }
}

interface ChatWindowProps {
  chat: Chat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { currentUser, setSidebarOpen } = useStore();
  const { messages } = useMessages(chat.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // Reply state
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

  // Edit state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCount = useRef(messages.length);

  const chatName = currentUser ? getChatName(chat, currentUser.uid) : "";
  const chatAvatar = currentUser ? getChatAvatar(chat, currentUser.uid) : { name: "" };

  // Play sound when new message arrives from someone else
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      const latest = messages[messages.length - 1];
      if (latest && latest.senderId !== currentUser?.uid) {
        playNotificationSound();
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages, currentUser?.uid]);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [text]);

  // Focus input when reply/edit is set
  useEffect(() => {
    if (replyTo || editingMessage) textareaRef.current?.focus();
  }, [replyTo, editingMessage]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !currentUser || sending) return;
    const msgText = text.trim();
    setText("");

    if (editingMessage) {
      // Edit mode
      setEditingMessage(null);
      try {
        await editMessage(chat.id, editingMessage.id, msgText);
      } catch (e) {
        setText(msgText);
      }
      return;
    }

    setSending(true);
    const replyData = replyTo ?? undefined;
    setReplyTo(null);
    try {
      await sendMessage(chat.id, currentUser, msgText, replyData);
    } catch (e) {
      setText(msgText);
    } finally {
      setSending(false);
    }
  }, [text, currentUser, chat.id, sending, replyTo, editingMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setReplyTo(null);
      setEditingMessage(null);
      setText("");
    }
  };

  const handleReply = (message: Message) => {
    setEditingMessage(null);
    setReplyTo({
      messageId: message.id,
      text: message.text,
      senderName: message.senderName,
    });
    textareaRef.current?.focus();
  };

  const handleEdit = (message: Message) => {
    setReplyTo(null);
    setEditingMessage(message);
    setText(message.text);
    textareaRef.current?.focus();
  };

  const handleDelete = async (message: Message) => {
    await deleteMessageForEveryone(chat.id, message.id);
  };

  const cancelAction = () => {
    setReplyTo(null);
    setEditingMessage(null);
    setText("");
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: typeof messages }[]>((acc, msg) => {
    if (!msg.createdAt) return acc;
    const date = msg.createdAt.toDate().toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long",
    });
    const last = acc[acc.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else acc.push({ date, msgs: [msg] });
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar name={chatAvatar.name} photoURL={chatAvatar.photoURL} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{chatName}</p>
          <p className="text-xs text-zinc-400 truncate">
            {chat.type === "group" ? `${chat.participants.length} members` : "Online"}
          </p>
        </div>
        {chat.type === "group" && (
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Users className="w-3.5 h-3.5" />
            {chat.participants.length}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              <Send className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400">No messages yet. Say hello!</p>
          </div>
        )}

        {groupedMessages.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[11px] text-zinc-400 font-medium px-2">{date}</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            {msgs.map((msg, i) => {
              const isOwn = msg.senderId === currentUser?.uid;
              const prevMsg = msgs[i - 1];
              const showSenderName = chat.type === "group" && !isOwn && prevMsg?.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  showSenderName={showSenderName}
                  totalParticipants={chat.participants.length}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Reply / Edit preview bar */}
      {(replyTo || editingMessage) && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
          <div className="w-0.5 h-8 rounded-full bg-brand-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-500">
              {editingMessage ? (
                <span className="flex items-center gap-1"><Pencil className="w-3 h-3" /> Editing message</span>
              ) : (
                <span className="flex items-center gap-1"><Reply className="w-3 h-3" /> Replying to {replyTo?.senderName}</span>
              )}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {editingMessage ? editingMessage.text : replyTo?.text}
            </p>
          </div>
          <button
            onClick={cancelAction}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? "Edit message..." : "Message..."}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 max-h-[120px] leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150",
              text.trim()
                ? "bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/30 scale-100"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 scale-95"
            )}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : editingMessage ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 mt-1.5 ml-1">Enter to send · Shift+Enter for new line · Esc to cancel</p>
      </div>
    </div>
  );
}
