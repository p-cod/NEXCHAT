"use client";
import { useState } from "react";
import { searchUsers, createGroupChat } from "@/lib/services";
import { useStore } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Search, Check, Loader2 } from "lucide-react";
import type { User } from "@/types";

interface NewGroupModalProps {
  onClose: () => void;
  onGroupCreated: (chatId: string) => void;
}

export function NewGroupModal({ onClose, onGroupCreated }: NewGroupModalProps) {
  const { currentUser } = useStore();
  const [step, setStep] = useState<"select" | "name">("select");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const users = await searchUsers(q, currentUser!.uid);
      setResults(users.filter((u) => !selected.find((s) => s.uid === u.uid)));
    } finally {
      setSearching(false);
    }
  };

  const toggleUser = (user: User) => {
    setSelected((prev) =>
      prev.find((u) => u.uid === user.uid)
        ? prev.filter((u) => u.uid !== user.uid)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { setError("Group name is required"); return; }
    if (selected.length === 0) { setError("Add at least one member"); return; }
    if (!currentUser) return;
    setCreating(true);
    try {
      const memberDetails: Record<string, { displayName: string; photoURL?: string }> = {};
      selected.forEach((u) => {
        memberDetails[u.uid] = { displayName: u.displayName, photoURL: u.photoURL || undefined };
      });
      const chatId = await createGroupChat(currentUser, groupName.trim(), selected.map((u) => u.uid), memberDetails);
      onGroupCreated(chatId);
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">New Group</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {step === "select" ? (
            <>
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selected.map((u) => (
                    <span key={u.uid} className="flex items-center gap-1.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-medium px-2.5 py-1 rounded-full">
                      {u.displayName}
                      <button onClick={() => toggleUser(u)} className="hover:text-brand-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search users to add..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div className="mt-3 max-h-52 overflow-y-auto space-y-1">
                {results.map((user) => {
                  const isSelected = !!selected.find((u) => u.uid === user.uid);
                  return (
                    <button
                      key={user.uid}
                      onClick={() => toggleUser(user)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <Avatar name={user.displayName} photoURL={user.photoURL} size="sm" />
                      <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.displayName}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                    </button>
                  );
                })}
                {query.length < 2 && results.length === 0 && (
                  <p className="text-center text-sm text-zinc-400 py-6">Type to search users</p>
                )}
              </div>

              <Button
                className="w-full mt-4"
                disabled={selected.length === 0}
                onClick={() => setStep("name")}
              >
                Next — {selected.length} member{selected.length !== 1 ? "s" : ""}
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Study Group, Friends..."
                error={error}
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" onClick={() => setStep("select")} className="flex-1">Back</Button>
                <Button onClick={handleCreate} loading={creating} className="flex-1">Create Group</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
