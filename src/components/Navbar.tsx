"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Columns3,
  Users2,
  LogOut,
  SquareCheck,
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

  return (
    <aside
        className="
          fixed left-0 top-0 z-50 h-screen w-[64px]
          flex flex-col items-center justify-between
          bg-[var(--orb-bg-surface)] border-r border-[var(--orb-border)]
          py-4
        "
        aria-label="Main Navigation"
      >
        {/* Top: Logo */}
        <div className="flex flex-col items-center gap-5 w-full px-3">
          {/* Brand icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => router.push("/board")}
                className="flex items-center justify-center size-10 rounded-xl bg-[var(--orb-primary)] text-white cursor-pointer border-0 hover:opacity-90 transition-opacity"
                aria-label="Todo — go to board"
              >
                <SquareCheck className="size-5 text-[var(--orb-accent)]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-bold">
              Todo
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-8 h-px bg-[var(--orb-border)]" />

          {/* Nav items */}
          <nav className="flex flex-col items-center gap-1.5 w-full">
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

        {/* Bottom: User avatar + logout */}
        <div className="flex flex-col items-center gap-2 w-full px-3">
          {currentUser && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-default">
                  <Avatar className="size-9 border-2 border-[var(--orb-border)] hover:border-[var(--orb-accent)] transition-colors">
                    <AvatarFallback className="bg-[var(--orb-primary)] text-white text-xs font-bold">
                      {getInitials(currentUser.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-[var(--orb-text-muted)] font-mono text-[10px]">
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
  );
}
