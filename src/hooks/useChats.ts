"use client";
import { useEffect } from "react";
import { subscribeToChats } from "@/lib/services";
import { useStore } from "@/store";

export function useChats() {
  const { currentUser, chats, setChats } = useStore();

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToChats(currentUser.uid, setChats);
    return unsub;
  }, [currentUser?.uid, setChats]);

  return { chats };
}
