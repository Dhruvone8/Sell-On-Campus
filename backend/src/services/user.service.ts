import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/error.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  department: true,
  year: true,
  profileImageUrl: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

export type UpdateProfileInput = {
  name?: string;
  department?: string | null;
  year?: number | null;
  profileImageUrl?: string | null;
};

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateUserProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...("department" in data && { department: data.department }),
      ...("year" in data && { year: data.year }),
      ...("profileImageUrl" in data && { profileImageUrl: data.profileImageUrl }),
    },
    select: SAFE_USER_SELECT,
  });

  return updatedUser;
}
