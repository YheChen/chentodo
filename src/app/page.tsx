"use client";

import { FormEvent, useState } from "react";
import AuthProvider, { useAuth } from "../components/AuthProvider";
import TodoList from "../components/todolist";

function AppContent() {
  const auth = useAuth() as {
    user: unknown;
    authError?: string;
    signInWithEmail: (
      email: string,
    ) => Promise<{ error: string | null }>;
  } | null;
  const user = auth?.user;
  const authError = auth?.authError;
  const signInWithEmail = auth?.signInWithEmail;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signInWithEmail) return;

    setSubmitting(true);
    setError("");
    setStatus("");

    const result = await signInWithEmail(email);
    if (result.error) {
      setError(result.error);
    } else {
      setStatus("Check your email for a sign-in link.");
      setEmail("");
    }

    setSubmitting(false);
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Chen&apos;s Todo List
        </h1>
        <p className="text-gray-500">
          Sign in to sync your tasks across devices
        </p>
        <form
          onSubmit={handleSignIn}
          className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-3"
        >
          {authError ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {authError}
            </p>
          ) : null}
          <label htmlFor="email" className="text-sm text-gray-600">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send sign-in link"}
          </button>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {status ? <p className="text-sm text-green-600">{status}</p> : null}
        </form>
      </div>
    );
  }

  return <TodoList />;
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
