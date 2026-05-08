"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { useChats } from "@/hooks/useChats";
import { signOut } from "@/lib/services";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { NewGroupModal } from "@/components/chat/NewGroupModal";
import { Avatar } from "@/components/ui/Avatar";
import {
  MessageSquare, LogOut, Moon, Sun, PenSquare, Users, Settings, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { currentUser, theme, toggleTheme, chats, activeChatId, setActiveChatId, messages, sidebarOpen } = useStore();
  useChats();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!currentUser) return null;

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    // On mobile, close sidebar when chat is selected
    if (window.innerWidth < 768) {
      useStore.getState().setSidebarOpen(false);
    }
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col w-full md:w-80 lg:w-96 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 transition-all duration-200",
          !sidebarOpen && "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white text-lg tracking-tight">NexChat</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              title="New Chat"
            >
              <PenSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              title="New Group"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 py-12">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No conversations yet</p>
                <p className="text-xs text-zinc-400 mt-1">Tap the pencil icon to start chatting</p>
              </div>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                currentUserId={currentUser.uid}
                isActive={chat.id === activeChatId}
                messages={messages[chat.id] ?? []}
                onClick={() => handleChatSelect(chat.id)}
              />
            ))
          )}
        </div>

        {/* Profile Footer */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Avatar name={currentUser.displayName} photoURL={currentUser.photoURL} size="sm" isOnline={true} />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{currentUser.displayName}</p>
                <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", showMenu && "rotate-180")} />
            </button>

            {showMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden animate-slide-up">
                <button
                  onClick={() => { signOut(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onChatCreated={(id) => { setActiveChatId(id); setShowNewChat(false); }}
        />
      )}
      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onGroupCreated={(id) => { setActiveChatId(id); setShowNewGroup(false); }}
        />
      )}
    </>
  );
}
