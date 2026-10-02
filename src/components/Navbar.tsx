"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Columns3,
  Users2,
  LogOut,
  SquareCheck,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserSafe } from "@/lib/types";

interface NavbarProps {
  currentUser: UserSafe | null;
  onOpenNewTodo?: () => void;
}

export function Navbar({ currentUser }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isMyBoard = pathname === "/board";
  const isSharedBoards = pathname === "/shared";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const navigateTo = (path: string) => {
    closeMenu();
    router.push(path);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--orb-border)] bg-[var(--orb-bg-surface)] px-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          ref={menuButtonRef}
          className="flex size-11 items-center justify-center rounded-xl text-[var(--orb-text-primary)] transition-colors hover:bg-[var(--orb-bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => navigateTo("/board")}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
          aria-label="Todo — go to board"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--orb-primary)]">
            <SquareCheck className="size-4 text-[var(--orb-accent)]" />
          </span>
          <span className="text-sm font-bold text-[var(--orb-text-primary)]">Todo</span>
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          isMenuOpen ? "" : "pointer-events-none"
        }`}
        inert={!isMenuOpen}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          onClick={closeMenu}
          className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-200 motion-reduce:transition-none ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close navigation menu"
          tabIndex={isMenuOpen ? 0 : -1}
        />

        <aside
          id="mobile-navigation"
          inert={!isMenuOpen}
          className={`absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col bg-[var(--orb-bg-surface)] shadow-[var(--orb-shadow-popup)] transition-transform duration-200 ease-out motion-reduce:transition-none ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Main Navigation"
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--orb-border)] px-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--orb-primary)]">
                <SquareCheck className="size-5 text-[var(--orb-accent)]" />
              </span>
              <span className="text-base font-bold text-[var(--orb-text-primary)]">Todo</span>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="flex size-11 items-center justify-center rounded-xl text-[var(--orb-text-muted)] transition-colors hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
              aria-label="Close navigation menu"
            >
              <X className="size-5" />
            </button>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 border-b border-[var(--orb-border)] px-5 py-4">
              <Avatar className="size-10 border-2 border-[var(--orb-border)]">
                <AvatarFallback className="bg-[var(--orb-primary)] text-xs font-bold text-white">
                  {getInitials(currentUser.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--orb-text-primary)]">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-[var(--orb-text-muted)]">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 px-3 py-4">
            <button
              type="button"
              onClick={() => navigateTo("/board")}
              aria-current={isMyBoard ? "page" : undefined}
              className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)] ${
                isMyBoard
                  ? "bg-[var(--orb-accent-subtle)] text-[var(--orb-accent)]"
                  : "text-[var(--orb-text-secondary)] hover:bg-[var(--orb-bg-muted)]"
              }`}
            >
              <Columns3 className="size-5" />
              My Board
            </button>
            <button
              type="button"
              onClick={() => navigateTo("/shared")}
              aria-current={isSharedBoards ? "page" : undefined}
              className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)] ${
                isSharedBoards
                  ? "bg-[var(--orb-accent-subtle)] text-[var(--orb-accent)]"
                  : "text-[var(--orb-text-secondary)] hover:bg-[var(--orb-bg-muted)]"
              }`}
            >
              <Users2 className="size-5" />
              Shared Boards
            </button>
          </nav>

          <div className="border-t border-[var(--orb-border)] p-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[var(--orb-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--orb-destructive)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
            >
              <LogOut className="size-5" />
              {isLoggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </aside>
      </div>

      <aside
        style={{ width: "240px" }}
        className="fixed left-0 top-0 z-50 hidden h-screen flex-col items-center justify-between border-r border-[var(--orb-border)] bg-[var(--orb-bg-surface)] py-3 shadow-sm lg:flex"
        aria-label="Main Navigation"
      >
        <div className="flex w-full flex-col items-center gap-6 px-5">
          <button
            type="button"
            onClick={() => router.push("/board")}
            className="flex h-[50px] w-full shrink-0 items-center justify-start gap-3 overflow-hidden rounded-xl border-0 bg-transparent text-[var(--orb-text-primary)] transition-colors hover:bg-[var(--orb-bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
            aria-label="Todo — go to board"
          >
            <span className="flex size-[50px] shrink-0 items-center justify-center rounded-xl bg-[var(--orb-primary)]">
              <SquareCheck className="size-5 text-[var(--orb-accent)]" />
            </span>
            <span className="text-sm font-bold">Todo</span>
          </button>

          <div className="h-px w-full shrink-0 bg-[var(--orb-border)]" />

          <nav className="flex w-full flex-col gap-1.5">
            <button
              type="button"
              onClick={() => router.push("/board")}
              aria-current={isMyBoard ? "page" : undefined}
              className={`flex h-11 w-full shrink-0 items-center justify-start gap-3 overflow-hidden rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)] ${
                isMyBoard
                  ? "bg-[var(--orb-accent-subtle)] text-[var(--orb-accent)]"
                  : "text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text-primary)]"
              }`}
            >
              <Columns3 className="size-[18px] shrink-0" />
              <span>My Board</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/shared")}
              aria-current={isSharedBoards ? "page" : undefined}
              className={`flex h-11 w-full shrink-0 items-center justify-start gap-3 overflow-hidden rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)] ${
                isSharedBoards
                  ? "bg-[var(--orb-accent-subtle)] text-[var(--orb-accent)]"
                  : "text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text-primary)]"
              }`}
            >
              <Users2 className="size-[18px] shrink-0" />
              <span>Shared Boards</span>
            </button>
          </nav>
        </div>

        <div className="flex w-full flex-col items-center gap-2 px-5">
          {currentUser && (
            <div className="flex h-11 w-full shrink-0 items-center justify-start gap-3 overflow-hidden rounded-xl px-2">
              <Avatar className="size-10 shrink-0 border-2 border-[var(--orb-border)]">
                <AvatarFallback className="bg-[var(--orb-primary)] text-xs font-bold text-white">
                  {getInitials(currentUser.name || "User")}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
                <span className="block truncate text-xs font-semibold text-[var(--orb-text-primary)]">
                  {currentUser.name}
                </span>
                <span className="block truncate text-[10px] text-[var(--orb-text-muted)]">
                  {currentUser.email}
                </span>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label={isLoggingOut ? "Signing out…" : "Sign Out"}
            className="flex h-11 w-full shrink-0 items-center justify-start gap-3 overflow-hidden rounded-xl px-3 text-[var(--orb-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--orb-destructive)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orb-accent)]"
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className="text-sm font-semibold">
              {isLoggingOut ? "Signing out…" : "Sign Out"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
