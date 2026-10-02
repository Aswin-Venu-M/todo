import { NextResponse } from "next/server";
import { User } from "@/lib/db";
import { hashPassword, signToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = RegisterSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in database
    const newUser = await User.create({
      name,
      email,
      passwordHash,
    });

    // Generate JWT token
    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: newUser.toSafeJSON(),
      },
      { status: 201 }
    );

    // Set secure HttpOnly session cookie
    response.cookies.set(AUTH_COOKIE_OPTIONS.name, token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
