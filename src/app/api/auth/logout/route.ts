import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
  response.cookies.delete("auth_token");
  return response;
}
