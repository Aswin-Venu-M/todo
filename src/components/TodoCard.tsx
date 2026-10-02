"use client";

import React, { useEffect, useRef, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import type { TodoAttributes, TodoPriority, TodoStatus } from "@/lib/types";

interface TodoCardProps {
  todo: TodoAttributes;
  isOwner: boolean;
  canEdit: boolean;
  onEdit: (todo: TodoAttributes) => void;
  onDelete: (todo: TodoAttributes) => void;
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
  onPriorityChange?: (todoId: string, newPriority: TodoPriority) => void;
  onDragStart?: (e: React.DragEvent, todoId: string) => void;
}

export function TodoCard({
  todo,
  isOwner,
  canEdit,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
}: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragPreviewRef = useRef<HTMLElement | null>(null);
  const dragOverHandlerRef = useRef<((event: DragEvent) => void) | null>(null);

  const removeDragPreview = () => {
    dragPreviewRef.current?.remove();
    dragPreviewRef.current = null;
    if (dragOverHandlerRef.current) {
      document.removeEventListener("dragover", dragOverHandlerRef.current);
      dragOverHandlerRef.current = null;
    }
  };

  useEffect(() => removeDragPreview, []);

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

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (!canEdit) return;
    removeDragPreview();

    const card = e.currentTarget;
    const bounds = card.getBoundingClientRect();
    const offsetX = e.clientX - bounds.left;
    const offsetY = e.clientY - bounds.top;
    e.dataTransfer.setData("text/plain", todo.id);
    e.dataTransfer.effectAllowed = "move";
    const emptyDragImage = document.createElement("canvas");
    emptyDragImage.width = 1;
    emptyDragImage.height = 1;
    e.dataTransfer.setDragImage(emptyDragImage, 0, 0);

    const preview = card.cloneNode(true) as HTMLElement;
    preview.removeAttribute("draggable");
    preview.setAttribute("aria-hidden", "true");
    Object.assign(preview.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: `${bounds.width}px`,
      margin: "0",
      opacity: "1",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: "9999",
      transition: "none",
      transform: `translate3d(${e.clientX - offsetX}px, ${e.clientY - offsetY}px, 0) rotate(1deg) scale(1.02)`,
      transformOrigin: `${offsetX}px ${offsetY}px`,
      boxShadow: "0 18px 38px rgba(16, 24, 40, 0.2), 0 4px 12px rgba(16, 24, 40, 0.12)",
      willChange: "transform",
    });
    document.body.appendChild(preview);
    dragPreviewRef.current = preview;

    const handleDocumentDragOver = (event: DragEvent) => {
      preview.style.transform = `translate3d(${event.clientX - offsetX}px, ${event.clientY - offsetY}px, 0) rotate(1deg) scale(1.02)`;
    };
    dragOverHandlerRef.current = handleDocumentDragOver;
    document.addEventListener("dragover", handleDocumentDragOver);

    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e, todo.id);
    }
  };

  const handleDragEnd = () => {
    removeDragPreview();
    setIsDragging(false);
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
      draggable={canEdit}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`orb-card orb-card-hover group relative !p-3.5 select-none ${
        canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } ${isDragging ? "opacity-45 ring-2 ring-dashed ring-[var(--orb-accent)]/50 !transform-none" : ""}`}
    >
      {/* Top Row: Priority Badge + Actions Dropdown */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={currentPriority.badgeClass}>
          <span className={`size-1.5 rounded-full ${currentPriority.dotClass}`} />
          {currentPriority.label}
        </span>

        {canEdit ? (
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="orb-btn orb-btn-icon orb-btn-ghost size-6 text-[var(--orb-text-muted)] hover:text-[var(--orb-text-primary)]"
                    aria-label="Task options"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Task options</TooltipContent>
              <DropdownMenuContent align="end" className="w-32 bg-[var(--orb-bg-surface)] border-[var(--orb-border)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => onEdit(todo)}
                    className="cursor-pointer text-[var(--orb-text-primary)] hover:bg-[var(--orb-bg-muted)]"
                  >
                    <Pencil className="size-3.5 mr-2 text-[var(--orb-accent)]" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => onDelete(todo)}
                      className="cursor-pointer text-[var(--orb-destructive)] hover:bg-[var(--orb-destructive-bg)]"
                    >
                      <Trash2 className="size-3.5 mr-2 text-[var(--orb-destructive)]" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
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
        {canEdit && (
          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {prevStatus && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onStatusChange(todo.id, prevStatus)}
                    aria-label="Move back"
                    className="orb-btn orb-btn-sm orb-btn-outline size-8 !p-0"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Move back</TooltipContent>
              </Tooltip>
            )}

            {nextStatus && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onStatusChange(todo.id, nextStatus)}
                    aria-label="Move forward"
                    className="orb-btn orb-btn-sm orb-btn-brand size-8 !p-0"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Move forward</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
