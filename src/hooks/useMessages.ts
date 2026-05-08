"use client";
import { useEffect } from "react";
import { subscribeToMessages, markMessagesRead } from "@/lib/services";
import { useStore } from "@/store";

export function useMessages(chatId: string | null) {
  const { currentUser, messages, setMessages } = useStore();
  const chatMessages = chatId ? (messages[chatId] ?? []) : [];

  useEffect(() => {
    if (!chatId || !currentUser) return;
    const unsub = subscribeToMessages(chatId, (msgs) => {
      setMessages(chatId, msgs);
      // Mark unread messages as read
      const unreadIds = msgs
        .filter((m) => m.senderId !== currentUser.uid && !m.readBy.includes(currentUser.uid))
        .map((m) => m.id);
      if (unreadIds.length) markMessagesRead(chatId, currentUser.uid, unreadIds);
    });
    return unsub;
  }, [chatId, currentUser?.uid, setMessages]);

  return { messages: chatMessages };
}
