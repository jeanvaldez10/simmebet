import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
) {
  try {
    const reqUrl = req.url
    const { searchParams } = new URL(reqUrl)
    const marketId = searchParams.get('marketId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!marketId || typeof marketId !== "string") {
      return NextResponse.json({ message: "Market ID is required" }, { status: 400 });
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ message: "Invalid pagination parameters" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const [activities, totalCount] = await Promise.all([
      prisma.userActivity.findMany({
        where: {
          details: {
            path: ['marketId'],
            equals: marketId
          }
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.userActivity.count({
        where: {
          details: {
            path: ['marketId'],
            equals: marketId
          }
        },
      }),
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching market activities:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}      
