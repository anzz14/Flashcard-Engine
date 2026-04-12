import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser(): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId: session.user.id };
}
