"use client";
import { useEffect } from "react";
import { onAuthChange, getUserById, setUserOnline } from "@/lib/services";
import { useStore } from "@/store";

export function useAuth() {
  const { currentUser, authLoading, setCurrentUser, setAuthLoading } = useStore();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const user = await getUserById(firebaseUser.uid);
        setCurrentUser(user);
        // Mark online
        await setUserOnline(firebaseUser.uid, true);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    // Mark offline on tab close
    const handleUnload = () => {
      const uid = useStore.getState().currentUser?.uid;
      if (uid) setUserOnline(uid, false);
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      unsub();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [setCurrentUser, setAuthLoading]);

  return { currentUser, authLoading };
}
