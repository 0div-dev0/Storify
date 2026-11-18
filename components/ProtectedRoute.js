"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] w-full bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sepia/20 border-t-sepia rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-ink-soft font-mono">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}

