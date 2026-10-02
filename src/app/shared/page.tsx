import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { User, Todo, BoardAccess } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Columns3, Users2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SharedBoardsPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const currentUser = await User.findByPk(session.userId);
  if (!currentUser) {
    redirect("/login");
  }

  // Find all BoardAccess records where the current user is the viewer
  const sharedAccesses = await BoardAccess.findAll({
    where: {
      viewerId: session.userId,
      canView: true,
    },
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "name", "email", "createdAt"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Calculate todo counts
  const sharedBoards = await Promise.all(
    sharedAccesses.map(async (access) => {
      const ownerInstance = (access as unknown as { owner?: User }).owner;
      if (!ownerInstance) return null;

      const todoCount = await Todo.count({
        where: { ownerId: access.ownerId },
      });

      return {
        id: access.id,
        ownerId: access.ownerId,
        ownerName: ownerInstance.name,
        ownerEmail: ownerInstance.email,
        todoCount,
        canEdit: access.canEdit,
        grantedAt: access.createdAt,
      };
    })
  );

  const validBoards = sharedBoards.filter(
    (b): b is NonNullable<typeof b> => b !== null
  );

  return (
    <div className="min-h-screen bg-[var(--orb-bg-app)] pt-14 md:pl-[64px] md:pt-0 md:pb-8">
      <Navbar currentUser={currentUser.toSafeJSON()} />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        <div className="mb-4 flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--orb-text-primary)]">
              Shared Workspaces
            </h1>
            <span className="orb-badge orb-badge-subtle-brand text-[11px] py-0.5 px-2.5">
              {validBoards.length} Accessible
            </span>
          </div>
          <p className="text-xs text-[var(--orb-text-muted)] font-medium">
            Collaborative boards shared with your account
          </p>
        </div>

        {validBoards.length === 0 ? (
          <div className="orb-card border-dashed p-10 text-center items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-[var(--orb-radius-field)] bg-[var(--orb-accent-subtle)] text-[var(--orb-accent)] mb-3">
              <Users2 className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--orb-text-primary)]">
              No shared boards yet
            </h3>
            <p className="mt-1 text-xs text-[var(--orb-text-muted)] max-w-sm mx-auto">
              When a team member grants viewing access to your email (
              <span className="font-semibold text-[var(--orb-text-primary)] font-mono">{currentUser.email}</span>
              ), their workspace will appear here.
            </p>
            <div className="mt-5">
              <Link href="/board">
                <button type="button" className="orb-btn orb-btn-brand">
                  Go to My Board
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {validBoards.map((board) => (
              <div
                key={board.id}
                className="orb-card orb-card-hover justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-[var(--orb-border)]">
                        <AvatarFallback className="font-bold text-xs bg-[var(--orb-primary)] text-white">
                          {board.ownerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--orb-text-primary)]">
                          {board.ownerName}
                        </h4>
                        <p className="text-[11px] font-mono text-[var(--orb-text-muted)] truncate max-w-[170px]">
                          {board.ownerEmail}
                        </p>
                      </div>
                    </div>
                    <span className="orb-badge orb-badge-subtle-pass text-[10px]">
                      {board.canEdit ? "EDITOR" : "VIEWER"}
                    </span>
                  </div>

                  <div className="rounded-[var(--orb-radius-md)] bg-[var(--orb-bg-muted)] p-3 border border-[var(--orb-border)] flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--orb-text-secondary)]">
                      <Columns3 className="size-3.5 text-[var(--orb-accent)]" />
                      Total Tasks:
                    </span>
                    <span className="font-mono font-bold text-[var(--orb-text-primary)] text-sm">
                      {board.todoCount}
                    </span>
                  </div>

                  <div className="text-[10.5px] text-[var(--orb-text-muted)] font-mono mt-3">
                    Access granted: {formatDate(board.grantedAt)}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--orb-border)]">
                  <Link href={`/board/${board.ownerId}`} className="w-full block">
                    <button
                      type="button"
                      className="orb-btn orb-btn-outline w-full justify-between"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="size-4 text-[var(--orb-accent)]" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
