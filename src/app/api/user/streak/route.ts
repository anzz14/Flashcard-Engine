import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId, error } = await getAuthenticatedUser();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCurrent: true,
        streakLongest: true,
        lastStudiedAt: true,
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({
      streakCurrent: user.streakCurrent,
      streakLongest: user.streakLongest,
      lastStudiedAt: user.lastStudiedAt,
    });
  } catch {
    return apiError("Failed to fetch streak", 500);
  }
}
