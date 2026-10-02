"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Lock,
  ArrowLeft,
  UserPlus2,
  LayoutGrid,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { TodoModal } from "./TodoModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ShareBoardModal } from "./ShareBoardModal";
import type { TodoAttributes, TodoPriority, TodoStatus, UserSafe } from "@/lib/types";

interface KanbanBoardProps {
  initialTodos: TodoAttributes[];
  owner: UserSafe;
  currentUser: UserSafe;
  isOwner: boolean;
  onRefresh?: () => void;
}

export function KanbanBoard({
  initialTodos,
  owner,
  currentUser,
  isOwner,
}: KanbanBoardProps) {
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
      body: JSON.stringify(data),
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
    if (!isOwner) return;

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
    if (!isOwner) return;

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
      {/* Read-Only Banner for Viewers */}
      {!isOwner && (
        <div className="orb-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-[var(--orb-border)] bg-[var(--orb-bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-[var(--orb-radius-md)] bg-[var(--orb-accent-subtle)] text-[var(--orb-accent)]">
              <Lock className="size-3.5 shrink-0" />
            </div>
            <div>
              <span className="orb-badge orb-badge-subtle-brand text-[9.5px] mr-2">
                READ-ONLY COLLABORATOR
              </span>
              <span className="text-xs text-[var(--orb-text-secondary)]">
                Viewing <strong className="text-[var(--orb-text-primary)]">{owner.name}'s</strong> board ({owner.email}).
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = "/board")}
            className="orb-btn orb-btn-sm orb-btn-outline cursor-pointer shrink-0"
          >
            <ArrowLeft className="size-3" />
            Back to my board
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* KPI 1: Total Tasks */}
        <div className="orb-kpi">
          <div className="orb-kpi-header">
            <span className="orb-kpi-label">Total Tasks</span>
            <div className="orb-kpi-icon-pill">
              <LayoutGrid className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="orb-kpi-value">{todos.length}</div>
            <div className="orb-kpi-subtitle">Across all board stages</div>
          </div>
        </div>

        {/* KPI 2: In Progress */}
        <div className="orb-kpi">
          <div className="orb-kpi-header">
            <span className="orb-kpi-label">In Progress</span>
            <div className="orb-kpi-icon-pill bg-[var(--orb-fail-bg)] text-[var(--orb-fail-text)]">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="orb-kpi-value">{todosByStatus.IN_PROGRESS.length}</div>
            <div className="orb-kpi-subtitle">Currently in execution</div>
          </div>
        </div>

        {/* KPI 3: Completed */}
        <div className="orb-kpi">
          <div className="orb-kpi-header">
            <span className="orb-kpi-label">Completed</span>
            <div className="orb-kpi-icon-pill bg-[var(--orb-pass-bg)] text-[var(--orb-pass-text)]">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="orb-kpi-value">{todosByStatus.DONE.length}</div>
            <div className="orb-kpi-subtitle">Finished tasks</div>
          </div>
        </div>

        {/* KPI 4: High Priority */}
        <div className="orb-kpi">
          <div className="orb-kpi-header">
            <span className="orb-kpi-label">High Priority</span>
            <div className="orb-kpi-icon-pill bg-[var(--orb-destructive-bg)] text-[var(--orb-destructive)]">
              <AlertTriangle className="size-3.5" />
            </div>
          </div>
          <div>
            <div className="orb-kpi-value">
              {todos.filter((t) => t.priority === "HIGH").length}
            </div>
            <div className="orb-kpi-subtitle">Urgent focus needed</div>
          </div>
        </div>
      </div>

      {/* BOARD CONTROLS: SEARCH, PRIORITY FILTER & OWNER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="orb-input-wrap orb-input-icon-left min-w-[200px] max-w-xs flex-1">
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

          {/* Priority Select */}
          <div className="min-w-[130px]">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="orb-select h-9 text-xs font-semibold cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Owner Action Buttons */}
        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="orb-btn orb-btn-sm orb-btn-outline hidden sm:inline-flex"
            >
              <UserPlus2 className="size-3.5 text-[var(--orb-accent)]" />
              <span>Share Board</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreateModalDefaultStatus("TODO");
                setIsCreateModalOpen(true);
              }}
              className="orb-btn orb-btn-sm orb-btn-brand"
            >
              <Plus className="size-3.5" />
              <span>New Task</span>
            </button>
          </div>
        )}
      </div>

      {/* KANBAN 3-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <KanbanColumn
          status="TODO"
          title="Todo"
          todos={todosByStatus.TODO}
          isOwner={isOwner}
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
      <TodoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTodo}
        defaultStatus={createModalDefaultStatus}
      />

      {/* Edit Todo Modal */}
      <TodoModal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        initialTodo={editingTodo}
        onSubmit={handleUpdateTodo}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingTodo}
        todo={deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDeleteTodo}
      />

      {/* Share Board Modal */}
      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
