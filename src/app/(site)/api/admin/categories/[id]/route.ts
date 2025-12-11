import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await context.params;

    const category = await prisma.marketCategory.findUnique({
      where: { id },
      include: {
        marketAssignments: {
          include: {
            market: {
              select: {
                id: true,
                name: true,
                question: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            marketAssignments: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await prisma.marketCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const { name, description, icon, isActive } = body;

    // If name is being updated, check for duplicates
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await prisma.marketCategory.findUnique({
        where: { name },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update the category
    const updatedCategory = await prisma.marketCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await context.params;

    // Check if category exists
    const existingCategory = await prisma.marketCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            marketAssignments: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has associated markets
    if (existingCategory._count.marketAssignments > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with associated markets. Please reassign or delete the markets first.",
          marketCount: existingCategory._count.marketAssignments,
        },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.marketCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
