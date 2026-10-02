import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { Todo } from "@/lib/db";
import { CreateTodoSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to view your todos" },
        { status: 401 }
      );
    }

    const todos = await Todo.findAll({
      where: { ownerId: session.userId },
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json({ success: true, todos });
  } catch (error) {
    console.error("Error fetching user todos:", error);
    return NextResponse.json(
      { error: "Failed to retrieve todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to create a todo" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = CreateTodoSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, status, priority } = parseResult.data;

    // Security requirement: Never trust ownerId from frontend.
    // Explicitly enforce ownerId from authenticated session token.
    const newTodo = await Todo.create({
      title,
      description: description || null,
      status,
      priority,
      ownerId: session.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Todo created successfully",
        todo: newTodo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
