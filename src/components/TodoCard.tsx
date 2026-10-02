"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import type { TodoAttributes, TodoPriority, TodoStatus } from "@/lib/types";

interface TodoCardProps {
  todo: TodoAttributes;
  isOwner: boolean;
  onEdit: (todo: TodoAttributes) => void;
  onDelete: (todo: TodoAttributes) => void;
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
  onPriorityChange?: (todoId: string, newPriority: TodoPriority) => void;
  onDragStart?: (e: React.DragEvent, todoId: string) => void;
}

export function TodoCard({
  todo,
  isOwner,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
}: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Semantic priority status styles
  const priorityConfig: Record<
    TodoPriority,
    { badgeClass: string; dotClass: string; label: string }
  > = {
    HIGH: {
      badgeClass: "orb-badge orb-badge-subtle-fail",
      dotClass: "bg-[var(--orb-fail)]",
      label: "High",
    },
    MEDIUM: {
      badgeClass: "orb-badge orb-badge-weak",
      dotClass: "bg-[var(--orb-weak-text)]",
      label: "Medium",
    },
    LOW: {
      badgeClass: "orb-badge orb-badge-subtle-pass",
      dotClass: "bg-[var(--orb-pass)]",
      label: "Low",
    },
  };

  const currentPriority = priorityConfig[todo.priority] || priorityConfig.MEDIUM;

  const handleDrag = (e: React.DragEvent) => {
    if (!isOwner) return;
    e.dataTransfer.setData("text/plain", todo.id);
    if (onDragStart) {
      onDragStart(e, todo.id);
    }
  };

  const nextStatusMap: Record<TodoStatus, TodoStatus | null> = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: null,
  };

  const prevStatusMap: Record<TodoStatus, TodoStatus | null> = {
    TODO: null,
    IN_PROGRESS: "TODO",
    DONE: "IN_PROGRESS",
  };

  const nextStatus = nextStatusMap[todo.status];
  const prevStatus = prevStatusMap[todo.status];

  return (
    <article
      draggable={isOwner}
      onDragStart={handleDrag}
      className={`orb-card orb-card-hover group relative !p-3.5 select-none ${
        isOwner ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
    >
      {/* Top Row: Priority Badge + Actions Dropdown */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={currentPriority.badgeClass}>
          <span className={`size-1.5 rounded-full ${currentPriority.dotClass}`} />
          {currentPriority.label}
        </span>

        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="orb-btn orb-btn-icon orb-btn-ghost size-6 text-[var(--orb-text-muted)] hover:text-[var(--orb-text-primary)]"
                title="Options"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-[var(--orb-bg-surface)] border-[var(--orb-border)]">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => onEdit(todo)}
                  className="cursor-pointer text-[var(--orb-text-primary)] hover:bg-[var(--orb-bg-muted)]"
                >
                  <Pencil className="size-3.5 mr-2 text-[var(--orb-accent)]" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(todo)}
                  className="cursor-pointer text-[var(--orb-destructive)] hover:bg-[var(--orb-destructive-bg)]"
                >
                  <Trash2 className="size-3.5 mr-2 text-[var(--orb-destructive)]" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="orb-badge orb-badge-neutral text-[9px] py-0.5 px-2">
            Read-Only
          </span>
        )}
      </div>

      {/* Task Title */}
      <h4 className="orb-card-title text-sm font-semibold text-[var(--orb-text-primary)] leading-snug break-words">
        {todo.title}
      </h4>

      {/* Optional Description */}
      {todo.description && (
        <div className="mt-1.5">
          <p
            className={`orb-card-desc text-xs text-[var(--orb-text-secondary)] leading-relaxed break-words ${
              !isExpanded && "line-clamp-2"
            }`}
          >
            {todo.description}
          </p>
          {todo.description.length > 80 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--orb-accent)] hover:text-[var(--orb-accent-hover)] cursor-pointer"
            >
              {isExpanded ? "Collapse" : "Read more"}
              <ChevronDown
                className={`size-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      )}

      {/* Card Footer: Date & Status Mover Controls */}
      <div className="mt-2.5 pt-2 border-t border-[var(--orb-border)] flex items-center justify-between text-[11px]">
        <span className="font-mono text-[10px] text-[var(--orb-text-muted)]">
          {formatDate(todo.createdAt)}
        </span>

        {/* Quick Transition Buttons (Owner Only) */}
        {isOwner && (
          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {prevStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(todo.id, prevStatus)}
                title="Move backward"
                className="orb-btn orb-btn-sm orb-btn-outline h-6 px-2 text-[10.5px]"
              >
                <ChevronLeft className="size-3" />
                <span>Back</span>
              </button>
            )}

            {nextStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(todo.id, nextStatus)}
                title="Move forward"
                className="orb-btn orb-btn-sm orb-btn-brand h-6 px-2 text-[10.5px]"
              >
                <span>Move</span>
                <ChevronRight className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
