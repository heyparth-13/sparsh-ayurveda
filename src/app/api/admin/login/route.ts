import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_123";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username === "admin" && password === "7259") {
      const token = jwt.sign(
        { id: "admin", email: "admin@sportsveda.com", name: "Sportsveda Admin", isAdmin: true },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const response = NextResponse.json({ success: true, message: "Login successful" });
      
      // Set token as a cookie
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid username or passcode" }, { status: 401 });
  } catch (error) {
    console.error("Admin login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
