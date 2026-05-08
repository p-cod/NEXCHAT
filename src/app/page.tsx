"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store";
import { AuthForm } from "@/components/auth/AuthForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageSquare } from "lucide-react";

export default function Home() {
  const { currentUser, authLoading } = useAuth();
  const { activeChatId, chats, theme, sidebarOpen } = useStore();

  // Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nexchat-theme") as "light" | "dark" | null;
    if (saved) {
      useStore.setState({ theme: saved });
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      // Default dark
      document.documentElement.classList.add("dark");
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center animate-pulse">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm />;
  }

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main chat area */}
      <main className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? "hidden md:flex" : "flex"}`}>
        {activeChat ? (
          <ChatWindow chat={activeChat} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
