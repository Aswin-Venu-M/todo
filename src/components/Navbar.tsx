"use client";

import React, { useEffect, useRef, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserSafe } from "@/lib/types";

interface NavbarProps {
  currentUser: UserSafe | null;
  onOpenNewTodo?: () => void;
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-xl
            transition-all duration-150 cursor-pointer border-0 outline-none
            ${
              danger
                ? "text-[var(--orb-text-muted)] hover:bg-red-50 hover:text-[var(--orb-destructive)]"
                : active
                ? "bg-[var(--orb-accent)] text-white shadow-sm shadow-emerald-200"
                : "text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text-primary)]"
            }
          `}
          aria-label={label}
        >
          <Icon className="size-[18px]" />
          {active && !danger && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-0.5 h-5 bg-[var(--orb-accent)] rounded-full" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs font-semibold">
        {label}
      </TooltipContent>
    </Tooltip>
  );
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
      if (event.key === "Escape") closeMenu();
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
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--orb-border)] bg-[var(--orb-bg-surface)] px-4 shadow-sm md:hidden">
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
        className={`fixed inset-0 z-[60] md:hidden ${
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
        className="
          fixed left-0 top-0 z-50 hidden h-screen w-[64px]
          flex-col items-center justify-between border-r border-[var(--orb-border)]
          bg-[var(--orb-bg-surface)] py-4 md:flex
        "
        aria-label="Main Navigation"
      >
        <div className="flex w-full flex-col items-center gap-5 px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => router.push("/board")}
                className="flex size-10 items-center justify-center rounded-xl border-0 bg-[var(--orb-primary)] text-white transition-opacity hover:opacity-90"
                aria-label="Todo — go to board"
              >
                <SquareCheck className="size-5 text-[var(--orb-accent)]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-bold">
              Todo
            </TooltipContent>
          </Tooltip>

          <div className="h-px w-8 bg-[var(--orb-border)]" />

          <nav className="flex w-full flex-col items-center gap-1.5">
            <NavItem
              icon={Columns3}
              label="My Board"
              active={isMyBoard}
              onClick={() => router.push("/board")}
            />
            <NavItem
              icon={Users2}
              label="Shared Boards"
              active={isSharedBoards}
              onClick={() => router.push("/shared")}
            />
          </nav>
        </div>

        <div className="flex w-full flex-col items-center gap-2 px-3">
          {currentUser && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-default">
                  <Avatar className="size-9 border-2 border-[var(--orb-border)] transition-colors hover:border-[var(--orb-accent)]">
                    <AvatarFallback className="bg-[var(--orb-primary)] text-xs font-bold text-white">
                      {getInitials(currentUser.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="font-mono text-[10px] text-[var(--orb-text-muted)]">
                  {currentUser.email}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <NavItem
            icon={LogOut}
            label={isLoggingOut ? "Signing out…" : "Sign Out"}
            onClick={handleLogout}
            danger
          />
        </div>
      </aside>
    </>
  );
}
