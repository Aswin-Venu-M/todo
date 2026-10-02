import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { BoardAccess } from "@/lib/db";

interface RouteContext {
  params: Promise<{ viewerId: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { viewerId } = await context.params;

    // Remove access grant owned by current user for the given viewer
    const deletedCount = await BoardAccess.destroy({
      where: {
        ownerId: session.userId,
        viewerId,
      },
    });

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: "Access permission not found or already revoked" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Access revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking board access:", error);
    return NextResponse.json(
      { error: "Failed to revoke board access" },
      { status: 500 }
    );
  }
}
