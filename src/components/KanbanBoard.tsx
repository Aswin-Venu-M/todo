"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  UserPlus2,
} from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { TodoModal } from "./TodoModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ShareBoardModal } from "./ShareBoardModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TodoAttributes, TodoPriority, TodoStatus, UserSafe } from "@/lib/types";

interface KanbanBoardProps {
  initialTodos: TodoAttributes[];
  owner: UserSafe;
  currentUser: UserSafe;
  isOwner: boolean;
  canEdit?: boolean;
  onRefresh?: () => void;
}

export function KanbanBoard({
  initialTodos,
  owner,
  currentUser,
  isOwner,
  canEdit: canEditGrant = false,
}: KanbanBoardProps) {
  const canEdit = isOwner || canEditGrant;
  const [todos, setTodos] = useState<TodoAttributes[]>(initialTodos);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultStatus, setCreateModalDefaultStatus] = useState<TodoStatus>("TODO");
  const [editingTodo, setEditingTodo] = useState<TodoAttributes | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<TodoAttributes | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Filtered todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === "ALL" || todo.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [todos, searchQuery, priorityFilter]);

  // Group by status
  const todosByStatus = useMemo(() => {
    return {
      TODO: filteredTodos.filter((t) => t.status === "TODO"),
      IN_PROGRESS: filteredTodos.filter((t) => t.status === "IN_PROGRESS"),
      DONE: filteredTodos.filter((t) => t.status === "DONE"),
    };
  }, [filteredTodos]);

  // Create Todo
  const handleCreateTodo = async (data: {
    title: string;
    description?: string;
    priority: TodoPriority;
    status: TodoStatus;
  }) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, ...(!isOwner && { ownerId: owner.id }) }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to create task");
    }

    setTodos((prev) => [result.todo, ...prev]);
  };

  // Update Todo details
  const handleUpdateTodo = async (data: {
    title: string;
    description?: string;
    priority: TodoPriority;
    status: TodoStatus;
  }) => {
    if (!editingTodo) return;

    const res = await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to update task");
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === editingTodo.id ? result.todo : t))
    );
  };

  // Status Change (via buttons or drag and drop)
  const handleStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    if (!canEdit) return;

    // Optimistic UI update
    const previousTodos = [...todos];
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task status");
      }
    } catch (err) {
      console.error(err);
      setTodos(previousTodos);
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (todoId: string) => {
    if (!canEdit) return;

    const previousTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== todoId));

    try {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      console.error(err);
      setTodos(previousTodos);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-1 sm:items-center">
          <div className="orb-input-wrap orb-input-icon-left min-w-0 w-full sm:max-w-xs sm:flex-1">
            <div className="orb-icon-slot-left">
              <Search className="size-3.5 text-[var(--orb-text-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="orb-input h-9 text-xs"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger
              className="h-9 w-full sm:w-[180px] shrink-0 text-xs font-semibold border-[var(--orb-border)] bg-[var(--orb-bg-surface)] focus:ring-[var(--orb-accent)] cursor-pointer"
              aria-label="Filter by priority"
            >
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="text-xs font-semibold">
              <SelectItem value="ALL" className="cursor-pointer">All Priorities</SelectItem>
              <SelectItem value="HIGH" className="cursor-pointer">High Priority</SelectItem>
              <SelectItem value="MEDIUM" className="cursor-pointer">Medium Priority</SelectItem>
              <SelectItem value="LOW" className="cursor-pointer">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="orb-btn orb-btn-outline hidden sm:inline-flex"
              >
                <UserPlus2 className="size-4 text-[var(--orb-accent)]" />
                <span>Share Board</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setCreateModalDefaultStatus("TODO");
                setIsCreateModalOpen(true);
              }}
              className="orb-btn orb-btn-brand"
            >
              <Plus className="size-4" />
              <span>New Task</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <KanbanColumn
          status="TODO"
          title="Todo"
          todos={todosByStatus.TODO}
          isOwner={isOwner}
          canEdit={canEdit}
          onEdit={(todo) => setEditingTodo(todo)}
          onDelete={(todo) => setDeletingTodo(todo)}
          onStatusChange={handleStatusChange}
          onDropTodo={handleStatusChange}
          onOpenCreateModal={(status) => {
            setCreateModalDefaultStatus(status);
            setIsCreateModalOpen(true);
          }}
        />

        <KanbanColumn
          status="IN_PROGRESS"
          title="In Progress"
          todos={todosByStatus.IN_PROGRESS}
          isOwner={isOwner}
          canEdit={canEdit}
          onEdit={(todo) => setEditingTodo(todo)}
          onDelete={(todo) => setDeletingTodo(todo)}
          onStatusChange={handleStatusChange}
          onDropTodo={handleStatusChange}
          onOpenCreateModal={(status) => {
            setCreateModalDefaultStatus(status);
            setIsCreateModalOpen(true);
          }}
        />

        <KanbanColumn
          status="DONE"
          title="Done"
          todos={todosByStatus.DONE}
          isOwner={isOwner}
          canEdit={canEdit}
          onEdit={(todo) => setEditingTodo(todo)}
          onDelete={(todo) => setDeletingTodo(todo)}
          onStatusChange={handleStatusChange}
          onDropTodo={handleStatusChange}
          onOpenCreateModal={(status) => {
            setCreateModalDefaultStatus(status);
            setIsCreateModalOpen(true);
          }}
        />
      </div>

      {/* Create Todo Modal */}
      {canEdit && (
        <TodoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTodo}
          defaultStatus={createModalDefaultStatus}
        />
      )}

      {/* Edit Todo Modal */}
      {canEdit && (
        <TodoModal
          isOpen={!!editingTodo}
          onClose={() => setEditingTodo(null)}
          initialTodo={editingTodo}
          onSubmit={handleUpdateTodo}
        />
      )}

      {/* Confirm Delete Modal */}
      {canEdit && (
        <ConfirmDeleteModal
          isOpen={!!deletingTodo}
          todo={deletingTodo}
          onClose={() => setDeletingTodo(null)}
          onConfirm={handleDeleteTodo}
        />
      )}

      {/* Share Board Modal */}
      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
