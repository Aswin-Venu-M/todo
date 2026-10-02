import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { User, Todo } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { KanbanBoard } from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function MyBoardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const user = await User.findByPk(session.userId);
  if (!user) {
    redirect("/login");
  }

  // Fetch todos owned by the current user
  const todos = await Todo.findAll({
    where: { ownerId: user.id },
    order: [["createdAt", "DESC"]],
  });

  const safeUser = user.toSafeJSON();

  const plainTodos = todos.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || null,
    status: t.status,
    priority: t.priority,
    ownerId: t.ownerId,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[var(--orb-bg-app)] text-[var(--orb-text-primary)] pl-[64px] pb-8 transition-all">
      <Navbar currentUser={safeUser} />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        <div className="mb-4 flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--orb-text-primary)]">
              Personal Workspace
            </h1>
            <span className="orb-badge orb-badge-subtle-brand text-[11px] py-0.5 px-2.5">
              {plainTodos.length} Tasks
            </span>
          </div>
          <p className="text-xs text-[var(--orb-text-muted)] font-medium">
            Manage your personal tasks across Todo, In Progress, and Done stages
          </p>
        </div>

        <KanbanBoard
          initialTodos={plainTodos}
          owner={safeUser}
          currentUser={safeUser}
          isOwner={true}
        />
      </main>
    </div>
  );
}
