import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { BoardAccess, User, Todo } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // Find all board access grants where the current user is the viewer
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

    // Enhance with todo counts for each shared board
    const results = await Promise.all(
      sharedAccesses.map(async (access) => {
        const todoCount = await Todo.count({
          where: { ownerId: access.ownerId },
        });

        // Format owner
        const ownerInstance = (access as unknown as { owner?: User }).owner;
        const owner = ownerInstance
          ? {
              id: ownerInstance.id,
              name: ownerInstance.name,
              email: ownerInstance.email,
            }
          : null;

        return {
          id: access.id,
          ownerId: access.ownerId,
          canView: access.canView,
          canEdit: access.canEdit,
          createdAt: access.createdAt,
          owner,
          todoCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      sharedBoards: results.filter((item) => item.owner !== null),
    });
  } catch (error) {
    console.error("Error fetching shared boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared boards" },
      { status: 500 }
    );
  }
}
