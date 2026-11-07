import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "No authenticated user found.",
    });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}