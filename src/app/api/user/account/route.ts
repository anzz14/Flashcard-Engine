import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiSuccess } from "@/lib/apiError";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const { userId, error } = await getAuthenticatedUser();
  if (error) return error;

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return apiSuccess({ success: true });
}
