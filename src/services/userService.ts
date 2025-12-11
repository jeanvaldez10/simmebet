/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { User } from "@supabase/supabase-js";
import { NotificationType } from "@/types/profile";
import { validateUsernameOrThrow } from "@/utils/validation";

export type WalletInfo = {
  walletAddress?: string;
  walletType?: string;
};

export type UserPositionData = {
  userId: string;
  marketId: string;
  amount: number;
  profit: number;
  belief?: number;
};

export async function createOrUpdateUser(
  supabaseUser: User
): Promise<User | any> {
  if (!supabaseUser) return;

  try {
    // Extract relevant data from Supabase user
    const { id: supabaseUserId, email, user_metadata } = supabaseUser;
    const name = user_metadata?.name;
    const username =
      user_metadata?.preferred_username || user_metadata?.user_name;
    const avatar = user_metadata?.avatar_url;
    const twitterId = user_metadata?.sub || user_metadata?.provider_id;

    // Check for username uniqueness if username is provided
    if (username) {
      // Validate username format
      validateUsernameOrThrow(username);
      
      const existingUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
          id: {
            not: supabaseUserId,
          },
        },
      });

      if (existingUser) {
        // If username already exists, append a random suffix
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const uniqueUsername = `${username}_${randomSuffix}`;
        
        // Validate the generated username
        validateUsernameOrThrow(uniqueUsername);
        
        const user = await prisma.user.upsert({
          where: { id: supabaseUserId },
          update: {
            email,
            name,
            username: uniqueUsername,
            avatar,
            twitterId,
          },
          create: {
            supabaseUserId,
            email,
            name,
            username: uniqueUsername,
            avatar,
            twitterId,
          },
        });
        return user;
      }
    }

    const user = await prisma.user.upsert({
      where: { id: supabaseUserId },
      update: {
        email,
        name,
        username,
        avatar,
        twitterId,
      },
      create: {
        supabaseUserId,
        email,
        name,
        username,
        avatar,
        twitterId,
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
}

export async function updateUserWallet(
  supabaseUserId: string,
  walletInfo: WalletInfo
): Promise<void> {
  if (!supabaseUserId) return;

  try {
    await prisma.user.update({
      where: { id: supabaseUserId },
      data: {
        walletAddress: walletInfo.walletAddress,
        walletType: walletInfo.walletType,
      },
    });
  } catch (error) {
    console.error("Error updating user wallet:", error);
    throw error;
  }
}

export async function updateUserProfile(
  supabaseUserId: string,
  profileData: {
    username?: string;
    email?: string;
    name?: string;
    avatar?: string;
  }
): Promise<void> {
  if (!supabaseUserId) return;

  try {
    // Validate username if provided
    if (profileData.username) {
      validateUsernameOrThrow(profileData.username);
    }

    await prisma.user.update({
      where: { id: supabaseUserId },
      data: {
        ...profileData,
        isProfileComplete: true,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function getUserByIdBasic(userId: string) {
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletAddress: true,
      },
    });
  } catch (error) {
    console.error("Error fetching user basic data:", error);
    return null;
  }
}

export async function getUserById(userId: string) {
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        positions: {
          include: {
            market: {
              select: {
                question: true,
                image: true,
                status: true,
              },
            },
          },
        },
        notifications: {
          select: {
            type: true,
            amount: true,
            message: true,
            createdAt: true,
            viewed: true,
            market: {
              select: {
                name: true,
                question: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        activities: true,
        balance: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function updateUser(
  id: string,
  data: {
    username?: string;
    email?: string;
    avatar?: string;
    telegram?: string;
    discord?: string;
    xAccount?: string | null;
    twitterId?: string | null;
  }
) {
  // Check if user is a Twitter user who signed up with Twitter
  const currentUser = await prisma.user.findUnique({
    where: { id },
    select: { twitterId: true, authenticatedType: true },
  });

  // Only block username changes for users who originally signed up with Twitter
  if (currentUser?.twitterId && currentUser?.authenticatedType === "social" && data.username) {
    throw new Error("Username cannot be changed for Twitter users");
  }

  if (data.username) {
    validateUsernameOrThrow(data.username);
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: data.username,
          mode: "insensitive",
        },
      },
    });

    if (existingUser && existingUser.id !== id) {
      throw new Error("Username already exists");
    }
  }

  const updateData: any = {
    email: data.email,
    avatar: data.avatar,
    telegram: data.telegram,
    discord: data.discord,
    xAccount: data.xAccount,
    twitterId: data.twitterId,
    updatedAt: new Date(),
  };

  // Only update username if user is not a Twitter user who signed up with Twitter
  if (!(currentUser?.twitterId && currentUser?.authenticatedType === "social") && data.username) {
    updateData.username = data.username.toLowerCase();
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return updatedUser;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  amount: string,
  message: string,
  marketId?: string | undefined
) {
  try {
    const response = await fetch("/api/notifications/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        amount,
        message,
        marketId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function createUserPosition(data: UserPositionData) {
  try {
    const response = await fetch("/api/positions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create position");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating position:", error);
    throw error;
  }
}

export async function updateUserBalance(
  userId: string,
  amount: number
): Promise<void> {
  if (!userId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        balance: true,
      },
    });

    if (!user) throw new Error("User not found");

    if (!user.balance) {
      await prisma.userBalance.create({
        data: {
          userId: user.id,
          balance: amount,
        },
      });
      return;
    }

    await prisma.userBalance.update({
      where: { userId: user.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
}

export async function createActivities(
  userId: string,
  marketId: string,
  betType: "PLACE_BET_YES" | "PLACE_BET_NO" | "CASH_OUT",
  amount: number,
  txHash?: string | null
) {
  try {
    const response = await fetch("/api/activities/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        marketId,
        betType,
        amount,
        txHash,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create activities");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating activities:", error);
    throw error;
  }
}
