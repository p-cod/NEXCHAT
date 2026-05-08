"use client";
import { useState, useCallback } from "react";
import { searchUsers, getUserById, getOrCreateDirectChat } from "@/lib/services";
import { useStore } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Search, Loader2 } from "lucide-react";
import type { User } from "@/types";

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatModal({ onClose, onChatCreated }: NewChatModalProps) {
  const { currentUser } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const users = await searchUsers(q, currentUser!.uid);
      setResults(users);
    } finally {
      setSearching(false);
    }
  }, [currentUser]);

  const handleStart = async (targetUser: User) => {
    if (!currentUser) return;
    setStarting(targetUser.uid);
    try {
      const chatId = await getOrCreateDirectChat(currentUser, targetUser);
      onChatCreated(chatId);
      onClose();
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">New Chat</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-3 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
            {results.length === 0 && query.length >= 2 && !searching && (
              <p className="text-center text-sm text-zinc-400 py-8">No users found</p>
            )}
            {results.length === 0 && query.length < 2 && (
              <p className="text-center text-sm text-zinc-400 py-8">Type a name to search</p>
            )}
            {results.map((user) => (
              <button
                key={user.uid}
                onClick={() => handleStart(user)}
                disabled={starting === user.uid}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <Avatar name={user.displayName} photoURL={user.photoURL} size="md" isOnline={user.isOnline} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.displayName}</p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
                {starting === user.uid && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
