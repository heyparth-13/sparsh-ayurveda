import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: { id: decoded.id, name: decoded.name, email: decoded.email } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
