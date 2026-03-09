"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { completeOnboarding } from "@/lib/actions/onboarding";

export default function OnboardingForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const { session } = useClerk();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await completeOnboarding(username);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.success) {
        setStatus("Refreshing session...");

        let attempts = 0;
        while (attempts < 10) {
          await session?.reload();
          const metadata = session?.user?.publicMetadata as any;
          if (metadata?.onboardingComplete === true) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        setStatus("Redirecting...");
        window.location.href = "/";
      }
    } catch (error) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="azem"
          required
          minLength={3}
          maxLength={30}
          pattern="^[a-z0-9_]+$"
          disabled={loading}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Lowercase letters, numbers, and underscores only.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? status || "Setting up your account..." : "Continue"}
      </button>
    </form>
  );
}