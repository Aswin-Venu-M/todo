import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Todo, BoardAccess } from "@/lib/db";
import { UpdateTodoSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const todo = await Todo.findByPk(id);

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    // Access check: User must be the owner OR have board access as a viewer
    const isOwner = todo.ownerId === session.userId;
    if (!isOwner) {
      const hasAccess = await BoardAccess.findOne({
        where: {
          ownerId: todo.ownerId,
          viewerId: session.userId,
          canView: true,
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view this todo" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, todo, isOwner });
  } catch (error) {
    console.error("Error retrieving todo:", error);
    return NextResponse.json(
      { error: "Failed to retrieve todo" },
      { status: 500 }
    );
  }
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

    const { id } = await context.params;
    const todo = await Todo.findByPk(id);

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    const isOwner = todo.ownerId === session.userId;
    const editGrant = isOwner ? null : await BoardAccess.findOne({
      where: {
        ownerId: todo.ownerId,
        viewerId: session.userId,
        canView: true,
        canEdit: true,
      },
    });

    if (!isOwner && !editGrant) {
      return NextResponse.json(
        { error: "Forbidden: You do not have edit access to this board" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = UpdateTodoSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, status, priority } = parseResult.data;

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description || null;
    if (status !== undefined) todo.status = status;
    if (priority !== undefined) todo.priority = priority;

    await todo.save();

    return NextResponse.json({
      success: true,
      message: "Todo updated successfully",
      todo,
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
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

    const { id } = await context.params;
    const todo = await Todo.findByPk(id);

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    if (todo.ownerId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the board owner can delete this todo" },
        { status: 403 }
      );
    }

    await todo.destroy();

    return NextResponse.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
