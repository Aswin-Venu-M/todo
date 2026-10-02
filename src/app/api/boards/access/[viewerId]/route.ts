import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { BoardAccess } from "@/lib/db";
import { UpdateAccessSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ viewerId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { viewerId } = await context.params;
    const body = await request.json();
    const parseResult = UpdateAccessSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const access = await BoardAccess.findOne({
      where: { ownerId: session.userId, viewerId },
    });

    if (!access) {
      return NextResponse.json(
        { error: "Access permission not found" },
        { status: 404 }
      );
    }

    access.canView = true;
    access.canEdit = parseResult.data.canEdit;
    await access.save();

    return NextResponse.json({
      success: true,
      message: access.canEdit ? "Edit access granted" : "Access changed to view-only",
      access: {
        viewerId: access.viewerId,
        canView: access.canView,
        canEdit: access.canEdit,
      },
    });
  } catch (error) {
    console.error("Error updating board access:", error);
    return NextResponse.json(
      { error: "Failed to update board access" },
      { status: 500 }
    );
  }
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
