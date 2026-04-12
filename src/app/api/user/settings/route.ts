import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiSuccess } from "@/lib/apiError";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId, error } = await getAuthenticatedUser();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      reminderEnabled: true,
    },
  });

  if (!user) {
    return apiError("User not found", 404);
  }

  return apiSuccess(user);
}

export async function PATCH(req: Request) {
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

  const { name, reminderEnabled } = body as {
    name?: unknown;
    reminderEnabled?: unknown;
  };

  const data: { name?: string; reminderEnabled?: boolean } = {};

  if (name !== undefined) {
    if (typeof name !== "string") {
      return apiError("Name must be a string", 400);
    }

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      return apiError("Name must be between 2 and 80 characters", 400);
    }

    data.name = trimmed;
  }

  if (reminderEnabled !== undefined) {
    if (typeof reminderEnabled !== "boolean") {
      return apiError("reminderEnabled must be a boolean", 400);
    }

    data.reminderEnabled = reminderEnabled;
  }

  if (Object.keys(data).length === 0) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        reminderEnabled: true,
      },
    });

    if (!currentUser) {
      return apiError("User not found", 404);
    }

    return apiSuccess(currentUser);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      name: true,
      email: true,
      reminderEnabled: true,
    },
  });

  return NextResponse.json(updatedUser);
}
