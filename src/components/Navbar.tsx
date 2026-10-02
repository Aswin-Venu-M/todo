"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Kanban,
  Users2,
  LogOut,
  UserPlus2,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShareBoardModal } from "./ShareBoardModal";
import type { UserSafe } from "@/lib/types";

interface NavbarProps {
  currentUser: UserSafe | null;
  onOpenNewTodo?: () => void;
  isOwner?: boolean;
}

export function Navbar({ currentUser, isOwner = true }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Desktop Navigation Rail */}
      <aside className="orb-rail hidden md:flex" aria-label="Main Navigation">
        {/* Top: Brand Logo */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => router.push("/board")}
            className="flex items-center justify-center size-11 rounded-[var(--orb-radius-field)] bg-[var(--orb-primary)] text-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
            title="Kanban Workspace"
          >
            <Sparkles className="size-5 text-[var(--orb-accent)]" />
          </button>
          <span className="text-[10px] font-bold tracking-tight text-[var(--orb-text-primary)]">
            KANBAN
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="orb-rail-nav">
          <button
            type="button"
            onClick={() => router.push("/board")}
            className={`orb-rail-link ${isMyBoard ? "active" : ""}`}
            title="My Personal Board"
          >
            <div className="orb-rail-icon-box">
              <Kanban className="size-5" />
            </div>
            <span className="orb-rail-label">My Board</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/shared")}
            className={`orb-rail-link ${isSharedBoards ? "active" : ""}`}
            title="Boards Shared With Me"
          >
            <div className="orb-rail-icon-box">
              <Users2 className="size-5" />
            </div>
            <span className="orb-rail-label">Shared</span>
          </button>

          {isMyBoard && isOwner && (
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="orb-rail-link"
              title="Manage Collaborator Access"
            >
              <div className="orb-rail-icon-box hover:border-[var(--orb-accent)]">
                <UserPlus2 className="size-5 text-[var(--orb-accent)]" />
              </div>
              <span className="orb-rail-label">Share</span>
            </button>
          )}
        </nav>

        {/* Bottom: Current User & Sign Out */}
        <div className="flex flex-col items-center gap-2 w-full mb-8">
          {currentUser && (
            <div
              className="flex flex-col items-center text-center cursor-pointer group"
              title={`${currentUser.name} (${currentUser.email})`}
            >
              <Avatar className="size-9 border-2 border-[var(--orb-accent-subtle)] shadow-xs group-hover:border-[var(--orb-accent)] transition-colors">
                <AvatarFallback className="bg-[var(--orb-primary)] text-[var(--orb-accent-subtle)] text-xs font-bold font-mono">
                  {getInitials(currentUser.name || "User")}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-semibold text-[var(--orb-text-muted)] truncate max-w-[70px] mt-0.5 group-hover:text-[var(--orb-text-primary)]">
                {currentUser.name?.split(" ")[0]}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="orb-btn orb-btn-icon orb-btn-ghost size-8 text-[var(--orb-text-muted)] hover:text-[var(--orb-destructive)] hover:bg-[var(--orb-destructive-bg)]"
            title="Sign Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-[var(--orb-border)] bg-[var(--orb-bg-surface)]/95 backdrop-blur-md px-4 py-2">
        <div className="flex items-center justify-between">
          <div
            onClick={() => router.push("/board")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="flex size-7 items-center justify-center rounded-[var(--orb-radius-md)] bg-[var(--orb-primary)] text-white">
              <Sparkles className="size-3.5 text-[var(--orb-accent)]" />
            </div>
            <span className="font-bold text-[var(--orb-text-primary)] tracking-tight text-sm">
              KanbanFlow
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isMyBoard && isOwner && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="orb-btn orb-btn-sm orb-btn-outline"
              >
                <UserPlus2 className="size-3.5 text-[var(--orb-accent)]" />
                <span>Share</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="orb-btn orb-btn-icon orb-btn-ghost size-8 text-[var(--orb-text-muted)]"
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Pills */}
        <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--orb-border)]">
          <button
            type="button"
            onClick={() => router.push("/board")}
            className={`flex-1 orb-tab ${isMyBoard ? "active-brand" : ""}`}
          >
            My Board
          </button>
          <button
            type="button"
            onClick={() => router.push("/shared")}
            className={`flex-1 orb-tab ${isSharedBoards ? "active-brand" : ""}`}
          >
            Shared Boards
          </button>
        </div>
      </header>

      {/* Share Board Modal */}
      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
}
