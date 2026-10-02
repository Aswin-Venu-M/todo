"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import type { TodoAttributes } from "@/lib/types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  todo: TodoAttributes | null;
  onClose: () => void;
  onConfirm: (todoId: string) => Promise<void>;
}

export function ConfirmDeleteModal({
  isOpen,
  todo,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!todo) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(todo.id);
      onClose();
    } catch (error) {
      console.error("Delete task failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[var(--orb-bg-surface)] border-[var(--orb-border)] rounded-[var(--orb-radius-card)] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base font-bold text-[var(--orb-text-primary)]">
            Delete Task
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--orb-text-muted)]">
            This action will permanently remove this item from your board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-[var(--orb-radius-md)] bg-[var(--orb-destructive-bg)] p-3 text-[var(--orb-destructive)] border border-[var(--orb-destructive)]/30 my-2 text-xs leading-relaxed">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            Are you sure you want to delete{" "}
            <strong className="font-bold">"{todo.title}"</strong>?
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-[var(--orb-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="orb-btn orb-btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="orb-btn orb-btn-destructive"
          >
            {isDeleting ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
