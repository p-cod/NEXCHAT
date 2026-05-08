import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-zinc-950 gap-4 text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Your messages</h2>
        <p className="text-sm text-zinc-400 mt-1 max-w-xs">
          Select a conversation from the sidebar, or start a new one using the pencil icon.
        </p>
      </div>
    </div>
  );
}
