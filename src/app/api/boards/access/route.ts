import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { BoardAccess, User } from "@/lib/db";
import { GrantAccessSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // List all users current user has granted access to
    const accesses = await BoardAccess.findAll({
      where: { ownerId: session.userId },
      include: [
        {
          model: User,
          as: "viewer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json({ success: true, accesses });
  } catch (error) {
    console.error("Error fetching board accesses:", error);
    return NextResponse.json(
      { error: "Failed to retrieve access permissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = GrantAccessSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, canView } = parseResult.data;

    // Check if the user is attempting to share with themselves
    if (email.toLowerCase() === session.email.toLowerCase()) {
      return NextResponse.json(
        { error: "You already own your board and cannot grant access to yourself" },
        { status: 400 }
      );
    }

    // Find the target user by email
    const targetUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `No registered user found with email "${email}"` },
        { status: 404 }
      );
    }

    // Upsert or create board access record
    const [accessRecord, created] = await BoardAccess.findOrCreate({
      where: {
        ownerId: session.userId,
        viewerId: targetUser.id,
      },
      defaults: {
        ownerId: session.userId,
        viewerId: targetUser.id,
        canView,
      },
    });

    if (!created && accessRecord.canView !== canView) {
      accessRecord.canView = canView;
      await accessRecord.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: created
          ? `Access granted to ${targetUser.name}`
          : `Access permissions updated for ${targetUser.name}`,
        access: {
          id: accessRecord.id,
          viewer: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
          },
          canView: accessRecord.canView,
        },
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    console.error("Error granting board access:", error);
    return NextResponse.json(
      { error: "Failed to grant board access" },
      { status: 500 }
    );
  }
}
