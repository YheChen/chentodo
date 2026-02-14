"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "../lib/supabase";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      if (!isMounted) return;
      setAuthError(
        "Session check timed out. You can still request an email sign-in link.",
      );
      setLoading(false);
    }, 7000);

    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;
        if (error) {
          setAuthError(error.message);
        } else {
          setUser(session?.user ?? null);
          setAuthError("");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load auth session", error);
        setAuthError(
          "Could not load your session. You can still request an email sign-in link.",
        );
      } finally {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setAuthError("");
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithEmail(email) {
    if (!supabase) {
      return { error: "Supabase is not configured." };
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      return { error: "Please enter an email address." };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError("");
    }

    return { error: error?.message ?? null };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg">
          Supabase is not configured. Add your credentials to .env.local
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signInWithEmail, signOut, authError }}>
      {children}
    </AuthContext.Provider>
  );
}
