"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck, Trash2, ShieldAlert, Loader2, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GrantedAccess {
  id: string;
  viewerId: string;
  canView: boolean;
  canEdit: boolean;
  viewer: {
    id: string;
    name: string;
    email: string;
  };
}

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareBoardModal({ isOpen, onClose }: ShareBoardModalProps) {
  const [email, setEmail] = useState("");
  const [accessList, setAccessList] = useState<GrantedAccess[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAccessList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch("/api/boards/access");
      if (res.ok) {
        const data = await res.json();
        setAccessList(data.accesses || []);
      }
    } catch (err) {
      console.error("Failed to fetch access list:", err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAccessList();
      setError(null);
      setSuccessMessage(null);
      setEmail("");
    }
  }, [isOpen, fetchAccessList]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a user email");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/boards/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), canView: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grant access");
      }

      setSuccessMessage(data.message || `Access granted to ${email}`);
      setEmail("");
      await fetchAccessList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to grant access");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (viewerId: string) => {
    setRevokingId(viewerId);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/boards/access/${viewerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke access");
      }

      setSuccessMessage("Access revoked");
      await fetchAccessList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revoke access");
    } finally {
      setRevokingId(null);
    }
  };

  const handleUpdateAccess = async (access: GrantedAccess, canEdit: boolean) => {
    if (canEdit === access.canEdit) return;

    setUpdatingId(access.viewerId);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/boards/access/${access.viewerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canEdit }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update access");
      }

      setSuccessMessage(data.message);
      await fetchAccessList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update access");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[var(--orb-bg-surface)] border-[var(--orb-border)] rounded-[var(--orb-radius-card)] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base font-bold text-[var(--orb-text-primary)]">
            Board Collaborators
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--orb-text-muted)]">
            Grant view or edit access to authenticated team members on your Kanban board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-[var(--orb-radius-md)] bg-[var(--orb-destructive-bg)] border border-[var(--orb-destructive)]/30 p-2.5 text-xs text-[var(--orb-destructive)]">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-[var(--orb-radius-md)] bg-[var(--orb-pass-bg)] border border-[var(--orb-pass)]/30 p-2.5 text-xs text-[var(--orb-pass-text)] font-medium">
              <UserCheck className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Invite Form */}
          <form onSubmit={handleGrantAccess} className="space-y-2">
            <div className="orb-form-group">
              <label htmlFor="share-email" className="orb-label">
                Add Collaborator by Email
              </label>
              <div className="flex gap-2">
                <input
                  id="share-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="orb-input flex-1"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="orb-btn orb-btn-brand shrink-0"
                >
                  <UserPlus className="size-4" />
                  <span>{isSubmitting ? "Adding..." : "Add"}</span>
                </button>
              </div>
            </div>

          </form>

          {/* Collaborators List */}
          <div className="pt-3 border-t border-[var(--orb-border)]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--orb-text-muted)] mb-2.5">
              Active Access Grants ({accessList.length})
            </h4>

            {isLoadingList ? (
              <div className="flex items-center justify-center py-6 text-[var(--orb-text-muted)] gap-2 text-xs">
                <Loader2 className="size-4 animate-spin text-[var(--orb-accent)]" />
                <span>Loading permissions...</span>
              </div>
            ) : accessList.length === 0 ? (
              <div className="rounded-[var(--orb-radius-md)] border border-dashed border-[var(--orb-border)] p-4 text-center text-xs text-[var(--orb-text-muted)]">
                No collaborators added yet. This board is strictly private to you.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto orb-scrollbar pr-1">
                {accessList.map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--orb-radius-md)] border border-[var(--orb-border)] bg-[var(--orb-bg-muted)] px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-7 border border-[var(--orb-border)]">
                        <AvatarFallback className="text-[10.5px] font-bold bg-[var(--orb-primary)] text-white">
                          {access.viewer?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="font-semibold text-[var(--orb-text-primary)] truncate">
                          {access.viewer?.name}
                        </p>
                        <p className="text-[10.5px] text-[var(--orb-text-muted)] truncate font-mono">
                          {access.viewer?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <Select
                          value={access.canEdit ? "edit" : "view"}
                          onValueChange={(value) =>
                            handleUpdateAccess(access, value === "edit")
                          }
                          disabled={updatingId === access.viewerId || revokingId === access.viewerId}
                        >
                          <SelectTrigger
                            aria-label={`Access level for ${access.viewer.name}`}
                            className="h-8 w-[92px] border-[var(--orb-border)] bg-[var(--orb-bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--orb-text-primary)] focus:ring-[var(--orb-accent)] disabled:cursor-wait disabled:opacity-60"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="text-xs font-semibold">
                            <SelectItem value="view">View</SelectItem>
                            <SelectItem value="edit">Edit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleRevokeAccess(access.viewerId)}
                            disabled={revokingId === access.viewerId || updatingId === access.viewerId}
                            aria-label={`Revoke access for ${access.viewer.name}`}
                            className="orb-btn orb-btn-icon orb-btn-destructive size-7 cursor-pointer"
                          >
                            {revokingId === access.viewerId ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">Revoke access</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
