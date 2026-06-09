import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, saveUser, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
