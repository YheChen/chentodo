"use client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasBrowserLocalStorage =
  typeof window !== "undefined" &&
  typeof window.localStorage?.getItem === "function";

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig && hasBrowserLocalStorage
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
