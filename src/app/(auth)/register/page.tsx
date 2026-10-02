"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SquareCheck, ArrowRight, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/board");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="orb-dot-grid min-h-screen flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-[var(--orb-radius-field)] bg-[var(--orb-primary)] text-white shadow-sm">
          <SquareCheck className="size-5 text-[var(--orb-accent)]" />
        </div>
        <h2 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--orb-text-primary)]">
          Create Your Account
        </h2>
        <p className="mt-0.5 text-xs text-[var(--orb-text-muted)] font-medium">
          Create your personalized Kanban workspace and invite collaborators
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="orb-card shadow-md p-5 sm:p-6">
          {error && (
            <div className="mb-3 rounded-[var(--orb-radius-md)] bg-[var(--orb-destructive-bg)] border border-[var(--orb-destructive)]/30 p-2 text-xs text-[var(--orb-destructive)] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            {/* Full Name */}
            <div className="orb-form-group">
              <label htmlFor="register-name" className="orb-label">
                Full Name <span className="orb-req">*</span>
              </label>
              <div className="orb-input-wrap orb-input-icon-left">
                <div className="orb-icon-slot-left">
                  <User className="size-4" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="orb-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="orb-form-group">
              <label htmlFor="register-email" className="orb-label">
                Email Address <span className="orb-req">*</span>
              </label>
              <div className="orb-input-wrap orb-input-icon-left">
                <div className="orb-icon-slot-left">
                  <Mail className="size-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="orb-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="orb-form-group">
              <label htmlFor="register-password" className="orb-label">
                Password <span className="orb-req">*</span> <span className="text-[var(--orb-text-muted)] font-normal text-[11px]">(min. 6 characters)</span>
              </label>
              <div className="orb-input-wrap orb-input-icon-left">
                <div className="orb-icon-slot-left">
                  <Lock className="size-4" />
                </div>
                <input
                  id="register-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="orb-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="orb-btn orb-btn-brand orb-btn-lg w-full mt-2"
            >
              <span>{isLoading ? "Creating account..." : "Create Account"}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[var(--orb-text-muted)]">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-[var(--orb-accent)] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
