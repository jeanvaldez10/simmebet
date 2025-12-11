/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UpdateUserArgs {
  email: string; // or use email if more appropriate
  password: string;
}

export const updateUserPassword = async ({
  email,
  password,
}: UpdateUserArgs) => {
  try {
    const hashedPassword = await bcrypt.hash(password as string, 12);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        status: false,
        message: "User not found",
      };
    }

    const isSamePassword = await bcrypt.compare(
      password,
      user.password as string
    );
    if (isSamePassword) {
      return {
        status: false,
        message:
          "New password cannot be same as old password, please set another new password.",
      };
    }
    // Update the user's password
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      status: true,
      message: "User password updated successfully",
    };
  } catch (error: any) {
    console.error("Update user password error:", error);
    return {
      status: false,
      message: "Update user password failed",
    };
  }
};
