import { create } from "zustand";
import type { User, Chat, Message } from "@/types";

interface AppStore {
  // Auth
  currentUser: User | null;
  authLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Chats
  chats: Chat[];
  activeChatId: string | null;
  setChats: (chats: Chat[]) => void;
  setActiveChatId: (id: string | null) => void;

  // Messages
  messages: Record<string, Message[]>;
  setMessages: (chatId: string, messages: Message[]) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppStore>((set) => ({
  // Auth
  currentUser: null,
  authLoading: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),

  // Theme — persist to localStorage
  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("nexchat-theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    }),

  // Chats
  chats: [],
  activeChatId: null,
  setChats: (chats) => set({ chats }),
  setActiveChatId: (id) => set({ activeChatId: id }),

  // Messages
  messages: {},
  setMessages: (chatId, messages) =>
    set((state) => ({ messages: { ...state.messages, [chatId]: messages } })),

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
