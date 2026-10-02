import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { User, Todo, BoardAccess } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Lock, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface SharedBoardPageProps {
  params: Promise<{ ownerId: string }>;
}

export default async function SharedBoardPage({ params }: SharedBoardPageProps) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const currentUser = await User.findByPk(session.userId);
  if (!currentUser) {
    redirect("/login");
  }

  const { ownerId } = await params;

  if (ownerId === session.userId) {
    redirect("/board");
  }

  const boardOwner = await User.findByPk(ownerId);
  if (!boardOwner) {
    return (
      <div className="min-h-screen bg-[var(--orb-bg-app)] flex flex-col pt-14 md:pl-[64px] md:pt-0 md:pb-8">
        <Navbar currentUser={currentUser.toSafeJSON()} />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="orb-card max-w-sm w-full text-center">
            <h2 className="text-base font-bold text-[var(--orb-text-primary)]">User Not Found</h2>
            <p className="mt-1 text-xs text-[var(--orb-text-muted)]">
              The board owner you are trying to view does not exist.
            </p>
            <div className="mt-5 flex justify-center">
              <Link href="/board">
                <button type="button" className="orb-btn orb-btn-brand">
                  Back to My Board
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Strict Backend Authorization Check:
  const accessGrant = await BoardAccess.findOne({
    where: {
      ownerId,
      viewerId: session.userId,
      canView: true,
    },
  });

  // 403 Forbidden Screen
  if (!accessGrant) {
    return (
      <div className="min-h-screen bg-[var(--orb-bg-app)] flex flex-col pt-14 md:pl-[64px] md:pt-0 md:pb-8">
        <Navbar currentUser={currentUser.toSafeJSON()} />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="orb-card max-w-md w-full text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-[var(--orb-radius-field)] bg-[var(--orb-destructive-bg)] text-[var(--orb-destructive)] mb-3">
              <Lock className="size-5" />
            </div>

            <span className="orb-badge orb-badge-subtle-fail text-[10px]">
              403 • ACCESS RESTRICTED
            </span>

            <h1 className="mt-2 text-xl font-bold text-[var(--orb-text-primary)]">
              Private Workspace
            </h1>

            <p className="mt-2 text-xs text-[var(--orb-text-secondary)] leading-relaxed">
              You do not have permission to view{" "}
              <strong className="text-[var(--orb-text-primary)]">{boardOwner.name}'s</strong> board (
              {boardOwner.email}). Access must be explicitly granted by the owner.
            </p>

            <div className="mt-6 flex justify-center">
              <Link href="/board">
                <button type="button" className="orb-btn orb-btn-brand">
                  <ArrowLeft className="size-3.5" />
                  Return to My Board
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Authorized viewer: Fetch todos
  const todos = await Todo.findAll({
    where: { ownerId },
    order: [["createdAt", "DESC"]],
  });

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

  const safeOwner = boardOwner.toSafeJSON();
  const safeCurrentUser = currentUser.toSafeJSON();

  return (
    <div className="min-h-screen bg-[var(--orb-bg-app)] pt-14 md:pl-[64px] md:pt-0 md:pb-8">
      <Navbar currentUser={safeCurrentUser} />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--orb-text-primary)]">
                {safeOwner.name}'s Board
              </h1>
              <span className="orb-badge orb-badge-subtle-brand text-[11px] py-0.5 px-2.5">
                {accessGrant.canEdit ? "EDITOR" : "READ-ONLY COLLABORATOR"}
              </span>
            </div>
            <p className="text-xs text-[var(--orb-text-muted)] font-medium">
              Shared with your account by {safeOwner.email}
            </p>
          </div>

          <Link
            href="/board"
            className="orb-btn orb-btn-sm orb-btn-outline shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            Back to my board
          </Link>
        </div>

        <KanbanBoard
          initialTodos={plainTodos}
          owner={safeOwner}
          currentUser={safeCurrentUser}
          isOwner={false}
          canEdit={accessGrant.canEdit}
        />
      </main>
    </div>
  );
}
