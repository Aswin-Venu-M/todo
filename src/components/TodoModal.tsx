"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { TodoAttributes, TodoPriority, TodoStatus } from "@/lib/types";

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: TodoPriority;
    status: TodoStatus;
  }) => Promise<void>;
  initialTodo?: TodoAttributes | null;
  defaultStatus?: TodoStatus;
}

export function TodoModal({
  isOpen,
  onClose,
  onSubmit,
  initialTodo,
  defaultStatus = "TODO",
}: TodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM");
  const [status, setStatus] = useState<TodoStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialTodo;

  useEffect(() => {
    if (initialTodo) {
      setTitle(initialTodo.title);
      setDescription(initialTodo.description || "");
      setPriority(initialTodo.priority);
      setStatus(initialTodo.status);
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus(defaultStatus);
    }
    setError(null);
  }, [initialTodo, defaultStatus, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save task";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[var(--orb-bg-surface)] border-[var(--orb-border)] rounded-[var(--orb-radius-card)] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base font-bold text-[var(--orb-text-primary)]">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--orb-text-muted)]">
            {isEditing
              ? "Update details, status, or priority for this item."
              : "Add an actionable task to your personal board."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-[var(--orb-radius-md)] bg-[var(--orb-destructive-bg)] border border-[var(--orb-destructive)]/30 p-2.5 text-xs text-[var(--orb-destructive)]">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="orb-form-group">
            <label htmlFor="todo-title" className="orb-label">
              Title <span className="orb-req">*</span>
            </label>
            <div className="orb-input-wrap">
              <input
                id="todo-title"
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoFocus
                className="orb-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="orb-form-group">
            <label htmlFor="todo-description" className="orb-label">
              Description <span className="text-[var(--orb-text-muted)] font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              id="todo-description"
              rows={3}
              placeholder="Add additional notes, context, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orb-textarea"
            />
          </div>

          {/* Priority Segmented Control */}
          <div className="orb-form-group">
            <label className="orb-label">Priority</label>
            <div className="orb-tabs inline-flex self-start">
              <button
                type="button"
                onClick={() => setPriority("LOW")}
                className={`orb-tab ${priority === "LOW" ? "active-pass" : ""}`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority("MEDIUM")}
                className={`orb-tab ${priority === "MEDIUM" ? "active-weak" : ""}`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority("HIGH")}
                className={`orb-tab ${priority === "HIGH" ? "active-fail" : ""}`}
              >
                High
              </button>
            </div>
          </div>

          {/* Status Segmented Control */}
          <div className="orb-form-group">
            <label className="orb-label">Status Stage</label>
            <div className="orb-tabs inline-flex self-start">
              <button
                type="button"
                onClick={() => setStatus("TODO")}
                className={`orb-tab ${status === "TODO" ? "active-brand" : ""}`}
              >
                Todo
              </button>
              <button
                type="button"
                onClick={() => setStatus("IN_PROGRESS")}
                className={`orb-tab ${status === "IN_PROGRESS" ? "active-brand" : ""}`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setStatus("DONE")}
                className={`orb-tab ${status === "DONE" ? "active-pass" : ""}`}
              >
                Done
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-[var(--orb-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="orb-btn orb-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="orb-btn orb-btn-brand"
            >
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
