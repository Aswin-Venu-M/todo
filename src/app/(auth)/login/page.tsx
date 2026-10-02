"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SquareCheck,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/board");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="orb-dot-grid min-h-screen flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto flex size-10 items-center justify-center rounded-[var(--orb-radius-field)] bg-[var(--orb-primary)] text-white shadow-sm">
          <SquareCheck className="size-5 text-[var(--orb-accent)]" />
        </div>
        <h2 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--orb-text-primary)]">
          Welcome to Todo
        </h2>
        <p className="mt-0.5 text-xs text-[var(--orb-text-muted)] font-medium">
          Collaborative Multi-User Kanban & Board Access System
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="orb-card shadow-md p-5 sm:p-6">
          {error && (
            <div className="mb-3 rounded-[var(--orb-radius-md)] bg-[var(--orb-destructive-bg)] border border-[var(--orb-destructive)]/30 p-2 text-xs text-[var(--orb-destructive)] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <div className="orb-form-group">
              <label htmlFor="login-email" className="orb-label">
                Email Address <span className="orb-req">*</span>
              </label>
              <div className="orb-input-wrap orb-input-icon-left">
                <div className="orb-icon-slot-left">
                  <Mail className="size-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
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
              <label htmlFor="login-password" className="orb-label">
                Password <span className="orb-req">*</span>
              </label>
              <div className="orb-input-wrap orb-input-icon-left">
                <div className="orb-icon-slot-left">
                  <Lock className="size-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="orb-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 flex size-8 items-center justify-center rounded-md text-[var(--orb-text-muted)] transition-colors hover:bg-[var(--orb-bg-hover)] hover:text-[var(--orb-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="orb-btn orb-btn-brand orb-btn-lg w-full mt-2"
            >
              <span>{isLoading ? "Signing in..." : "Sign In to Workspace"}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="mt-4 pt-3.5 border-t border-[var(--orb-border)]">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[var(--orb-text-muted)] mb-2">
              Select Demo User (Click to autofill)
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => fillDemoAccount("user1@gmail.com")}
                className={`w-full flex items-center justify-start p-2.5 rounded-[var(--orb-radius-md)] border text-left transition-all cursor-pointer ${
                  email === "user1@gmail.com"
                    ? "bg-[var(--orb-accent-subtle)] border-[var(--orb-accent)] text-[var(--orb-text-primary)]"
                    : "border-[var(--orb-border)] hover:bg-[var(--orb-bg-muted)] text-[var(--orb-text-secondary)]"
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-[var(--orb-text-primary)]">
                    User 1
                  </span>
                  <span className="block text-[10px] text-[var(--orb-text-muted)] font-mono">
                    user1@gmail.com
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("user2@gmail.com")}
                className={`w-full flex items-center justify-start p-2.5 rounded-[var(--orb-radius-md)] border text-left transition-all cursor-pointer ${
                  email === "user2@gmail.com"
                    ? "bg-[var(--orb-accent-subtle)] border-[var(--orb-accent)] text-[var(--orb-text-primary)]"
                    : "border-[var(--orb-border)] hover:bg-[var(--orb-bg-muted)] text-[var(--orb-text-secondary)]"
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-[var(--orb-text-primary)]">
                    User 2
                  </span>
                  <span className="block text-[10px] text-[var(--orb-text-muted)] font-mono">
                    user2@gmail.com
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[var(--orb-text-muted)]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[var(--orb-accent)] hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
