import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { User, Todo, BoardAccess } from "@/lib/db";

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to view boards" },
        { status: 401 }
      );
    }

    const { ownerId } = await context.params;

    // Check if owner exists
    const owner = await User.findByPk(ownerId, {
      attributes: ["id", "name", "email", "createdAt"],
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Board owner not found" },
        { status: 404 }
      );
    }

    const isOwner = session.userId === ownerId;

    // Backend Authorization Rule:
    // 1. Authenticated user can ALWAYS access their own board.
    // 2. Authenticated user can access another user's board ONLY when an allowed BoardAccess record exists.
    // 3. Otherwise, return 403 Forbidden.
    if (!isOwner) {
      const accessRecord = await BoardAccess.findOne({
        where: {
          ownerId,
          viewerId: session.userId,
          canView: true,
        },
      });

      if (!accessRecord) {
        return NextResponse.json(
          {
            error: "Forbidden: You do not have permission to view this user's board",
            code: "BOARD_ACCESS_DENIED",
          },
          { status: 403 }
        );
      }
    }

    // Retrieve all todos belonging to this board's owner
    const todos = await Todo.findAll({
      where: { ownerId },
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json({
      success: true,
      owner: owner.toSafeJSON ? owner.toSafeJSON() : owner,
      isOwner,
      canView: true,
      todos,
    });
  } catch (error) {
    console.error("Error retrieving board todos:", error);
    return NextResponse.json(
      { error: "Failed to retrieve board todos" },
      { status: 500 }
    );
  }
}
