import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.userNotification.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        market: {
          select: {
            question: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedNotifications = notifications.map(notification => {
      // Format the timestamp to a relative time string
      const now = new Date();
      const createdAt = new Date(notification.createdAt);
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
      
      let when = "";
      if (diffInMinutes < 1) {
        when = "Just now";
      } else if (diffInMinutes < 60) {
        when = `${diffInMinutes}min ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        when = `${hours}h ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        when = `${days}d ago`;
      }

      return {
        id: parseInt(notification.id),
        message: notification.message || `${notification.type} of $${notification.amount}`,
        when: when,
        type: notification.type as "buy" | "deposit" | "withdraw" | "sell" | "win",
        amount: notification.amount,
        marketId: notification.marketId,
        marketName: notification.market?.question || notification.market?.name,
        viewed: notification.viewed,
        createdAt: notification.createdAt,
      };
    });

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
