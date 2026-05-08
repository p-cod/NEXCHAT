"use client";
import { useState } from "react";
import { registerUser, loginUser } from "@/lib/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageSquare } from "lucide-react";

type Mode = "login" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!displayName.trim()) { setError("Display name is required"); setLoading(false); return; }
        await registerUser(email, password, displayName.trim());
      } else {
        await loginUser(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("email-already-in-use")) setError("Email already registered");
      else if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) setError("Invalid email or password");
      else if (msg.includes("weak-password")) setError("Password must be at least 6 characters");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <MessageSquare className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">NexChat</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <Input
                id="displayName"
                label="Display Name"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
              />
            )}
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === "login"}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={error}
            />
            <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-brand-500 hover:text-brand-600 font-medium"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
