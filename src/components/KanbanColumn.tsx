"use client";

import React, { useState } from "react";
import { Circle, Clock, CheckCircle2, Plus } from "lucide-react";
import { TodoCard } from "./TodoCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TodoAttributes, TodoPriority, TodoStatus } from "@/lib/types";

interface KanbanColumnProps {
  status: TodoStatus;
  title: string;
  todos: TodoAttributes[];
  isOwner: boolean;
  canEdit: boolean;
  onEdit: (todo: TodoAttributes) => void;
  onDelete: (todo: TodoAttributes) => void;
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
  onPriorityChange?: (todoId: string, newPriority: TodoPriority) => void;
  onDropTodo: (todoId: string, targetStatus: TodoStatus) => void;
  onOpenCreateModal?: (defaultStatus: TodoStatus) => void;
}

export function KanbanColumn({
  status,
  title,
  todos,
  isOwner,
  canEdit,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onDropTodo,
  onOpenCreateModal,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const columnConfig = {
    TODO: {
      icon: Circle,
      iconColor: "text-[var(--orb-accent)]",
      badgeClass: "orb-badge orb-badge-subtle-brand",
    },
    IN_PROGRESS: {
      icon: Clock,
      iconColor: "text-[var(--orb-fail)]",
      badgeClass: "orb-badge orb-badge-subtle-fail",
    },
    DONE: {
      icon: CheckCircle2,
      iconColor: "text-[var(--orb-pass-text)]",
      badgeClass: "orb-badge orb-badge-subtle-pass",
    },
  }[status];

  const IconComponent = columnConfig.icon;

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    setIsDragOver(false);
    const todoId = e.dataTransfer.getData("text/plain");
    if (todoId) {
      onDropTodo(todoId, status);
    }
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`orb-card-container flex flex-col border border-[var(--orb-border)] bg-[var(--orb-bg-muted)]/70 p-2.5 sm:p-3 min-h-[520px] transition-all ${
        isDragOver ? "kanban-drag-active" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 mb-1.5 px-0.5 border-b border-[var(--orb-border)]">
        <div className="flex items-center gap-2">
          <IconComponent className={`size-3.5 ${columnConfig.iconColor}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--orb-text-primary)]">
            {title}
          </h3>
          <span className={columnConfig.badgeClass}>
            {todos.length}
          </span>
        </div>

        {canEdit && onOpenCreateModal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onOpenCreateModal(status)}
                className="orb-btn orb-btn-icon orb-btn-ghost size-6 text-[var(--orb-text-muted)] hover:text-[var(--orb-text-primary)]"
                aria-label={`Add task to ${title}`}
              >
                <Plus className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Add task to {title}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Cards List */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto orb-scrollbar pr-0.5">
        {todos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--orb-radius-lg)] border border-dashed border-[var(--orb-border)] p-6 text-center my-2">
            <span className="text-xs font-medium text-[var(--orb-text-muted)]">No tasks in this stage</span>
            {canEdit && onOpenCreateModal && (
              <button
                type="button"
                onClick={() => onOpenCreateModal(status)}
                className="orb-btn orb-btn-sm orb-btn-outline mt-3"
              >
                <Plus className="size-3.5 text-[var(--orb-accent)]" />
                Add task
              </button>
            )}
          </div>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              isOwner={isOwner}
              canEdit={canEdit}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
            />
          ))
        )}
      </div>
    </section>
  );
}
