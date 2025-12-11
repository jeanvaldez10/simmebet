import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        categoryAssignments: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    // Transform category assignments to categories array
    const categories =
      market.categoryAssignments?.map(
        (assignment: {
          category: { id: string; name: string; icon: string | null };
        }) => ({
          id: assignment.category.id,
          name: assignment.category.name,
          icon: assignment.category.icon,
        })
      ) || [];

    const marketWithCategories = {
      ...market,
      categories,
    };

    console.log("Returning market with categories:", categories);
    return NextResponse.json({ market: marketWithCategories });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    console.log("Update market request body:", JSON.stringify(body, null, 2));
    const { categoryIds, ...marketData } = body;
    console.log("Category IDs received:", categoryIds);

    // Convert null values to undefined for Prisma and handle date conversion
    // Also filter out fields that don't exist on the Market model
    const prismaData = Object.fromEntries(
      Object.entries(marketData)
        .filter(([key]) => key !== "categories") // Remove categories as it's not a Market model field
        .map(([key, value]) => {
          if (value === null) {
            return [key, undefined];
          }
          // Convert date string to DateTime for Prisma
          if (key === "date" && typeof value === "string" && value) {
            return [key, new Date(value)];
          }
          return [key, value];
        })
    );

    await prisma.market.update({
      where: { id },
      data: prismaData,
    });

    // Handle category assignments if categoryIds are provided
    if (categoryIds !== undefined) {
      // Delete existing assignments
      await prisma.marketCategoryAssignment.deleteMany({
        where: { marketId: id },
      });

      // Create new assignments
      if (categoryIds.length > 0) {
        await prisma.marketCategoryAssignment.createMany({
          data: categoryIds.map((categoryId: string) => ({
            marketId: id,
            categoryId: categoryId,
          })),
        });
      }
    }

    // Get updated market with fresh category assignments
    const updatedMarket = await prisma.market.findUnique({
      where: { id },
      include: {
        categoryAssignments: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    // Transform category assignments to categories array
    const categories =
      updatedMarket?.categoryAssignments?.map(
        (assignment: {
          category: { id: string; name: string; icon: string | null };
        }) => ({
          id: assignment.category.id,
          name: assignment.category.name,
          icon: assignment.category.icon,
        })
      ) || [];

    const marketWithCategories = {
      ...updatedMarket,
      categories,
    };

    return NextResponse.json({ market: marketWithCategories });
  } catch (error) {
    console.error("Error updating market:", error);
    return NextResponse.json(
      { error: "Failed to update market" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    await prisma.market.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting market:", error);
    return NextResponse.json(
      { error: "Failed to delete market" },
      { status: 500 }
    );
  }
}
