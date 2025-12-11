/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/actions/updateUser.ts
"use server";

import prisma from "@/lib/prisma";

interface UpdateUserArgs {
  userId: string; // or use email if more appropriate
  userName: string;
  image?: string;
}

export const updateUser = async ({
  userId,
  userName,
  image,
}: UpdateUserArgs) => {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: userName,
        avatar: image,
        // isProfileComplete: true,
      },
    });

    return {
      status: true,
      message: "User updated successfully",
    };
  } catch (error: any) {
    console.error("Update user error:", error);
    return {
      status: false,
      message: "Update user failed",
    };
  }
};
