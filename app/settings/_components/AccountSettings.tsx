"use client";

import { useState, useTransition } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function AccountSettings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  // Password
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [isPwPending, startPwTransition] = useTransition();

  // Account deletion
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  function handlePasswordUpdate() {
    setPwError(null);
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPwError("All fields are required");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPwError("New passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    startPwTransition(async () => {
      try {
        await user?.updatePassword({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        });
        setPasswords({ current: "", new: "", confirm: "" });
        setPwSaved(true);
        setTimeout(() => setPwSaved(false), 3000);
      } catch (e: any) {
        setPwError(e?.errors?.[0]?.message ?? "Failed to update password");
      }
    });
  }

  function handleDeleteAccount() {
    if (deleteConfirm !== "delete my account") return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await user?.delete();
        await signOut({ redirectUrl: "/" });
      } catch (e: any) {
        setDeleteError(e?.errors?.[0]?.message ?? "Failed to delete account");
      }
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50 mb-1">Account</h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Manage your email, password and account security.
        </p>
      </div>

      {/* Email */}
      <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Email address</p>
        <div className="flex items-center justify-between gap-4 p-4 border border-zinc-100 dark:border-zinc-900">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {user?.emailAddresses[0]?.emailAddress ?? "—"}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">Primary email · Verified</p>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Password</p>
        <div className="space-y-3 max-w-sm">
          {([
            { key: "current" as const, label: "Current password" },
            { key: "new" as const, label: "New password" },
            { key: "confirm" as const, label: "Confirm new password" },
          ]).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label htmlFor={key} className="text-xs text-zinc-500 dark:text-zinc-400">{label}</label>
              <input
                id={key}
                type="password"
                value={passwords[key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-50 transition-colors"
              />
            </div>
          ))}
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          {pwSaved && <p className="text-xs text-emerald-500">Password updated ✓</p>}
          <button
            onClick={handlePasswordUpdate}
            disabled={isPwPending}
            className="px-5 py-2 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
          >
            {isPwPending ? "Updating..." : "Update password"}
          </button>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          If you signed up with Google, you can set a password here to also enable email login.
        </p>
      </div>

      {/* Connected accounts */}
      <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Connected accounts</p>
        <div className="flex items-center justify-between gap-4 p-4 border border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Google</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">Connected</p>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            Active
          </span>
        </div>
      </div>

      {/* Sign out */}
      <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-900">
        <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Session</p>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="px-5 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-50 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Danger zone */}
      <div className="space-y-4">
        <button
          onClick={() => setShowDeleteZone(!showDeleteZone)}
          className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          Danger zone
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${showDeleteZone ? "rotate-180" : ""}`}>
            <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showDeleteZone && (
          <div className="border border-red-200 dark:border-red-900 p-5 space-y-4 animate-in fade-in duration-200">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Delete account</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will permanently delete your account, all your posts, comments, and data. This cannot be undone.
              </p>
            </div>
            <div className="space-y-2 max-w-sm">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Type <strong>delete my account</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="delete my account"
                className="w-full border border-red-200 dark:border-red-900 bg-transparent px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-red-500 transition-colors"
              />
              {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "delete my account" || isDeletePending}
                className="px-5 py-2 text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isDeletePending ? "Deleting..." : "Permanently delete account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
