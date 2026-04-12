import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, error } = await getAuthenticatedUser();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  if (!body || typeof body !== "object") {
    return apiError("Invalid request body", 400);
  }

  const { currentPassword, newPassword } = body as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return apiError("currentPassword and newPassword are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    return apiError("User not found", 404);
  }

  if (!user.password) {
    return apiError("No password set on this account", 400);
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return apiError("Current password is incorrect", 400);
  }

  if (newPassword.length < 8) {
    return apiError("New password must be at least 8 characters", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: passwordHash,
    },
  });

  return apiSuccess({ success: true });
}
