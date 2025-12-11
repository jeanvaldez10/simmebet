import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { CarouselAlignment, CarouselStatus } from "@prisma/client";

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

    const carouselItem = await prisma.carouselItem.findUnique({
      where: { id },
    });

    if (!carouselItem) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: carouselItem });
  } catch (error) {
    console.error("Error fetching carousel item:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel item" },
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

    // Check if carousel item exists
    const existingItem = await prisma.carouselItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    const {
      title,
      subtitle,
      date,
      description,
      imageSrc,
      marketId,
      useSocialImage,
      mobileBannerSrc,
      alignment,
      isVideo,
      betChance,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      status,
      orderIndex,
    } = body;

    // Validate alignment enum if provided
    let validAlignment: CarouselAlignment | undefined;
    if (alignment) {
      validAlignment = alignment.toUpperCase() as CarouselAlignment;
      if (!Object.values(CarouselAlignment).includes(validAlignment)) {
        return NextResponse.json(
          { error: "Invalid alignment value. Must be LEFT or CENTER" },
          { status: 400 }
        );
      }
    }

    // Validate status enum if provided
    let validStatus: CarouselStatus | undefined;
    if (status) {
      validStatus = status.toUpperCase() as CarouselStatus;
      if (!Object.values(CarouselStatus).includes(validStatus)) {
        return NextResponse.json(
          {
            error:
              "Invalid status value. Must be DRAFT, PUBLISHED, or ARCHIVED",
          },
          { status: 400 }
        );
      }
    }

    // Update the carousel item
    const updatedItem = await prisma.carouselItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(date !== undefined && { date }),
        ...(description !== undefined && { description }),
        ...(imageSrc !== undefined && { imageSrc }),
        ...(marketId !== undefined && { marketId: marketId || null }),
        ...(useSocialImage !== undefined && {
          useSocialImage: Boolean(useSocialImage),
        }),
        ...(mobileBannerSrc !== undefined && {
          mobileBannerSrc: mobileBannerSrc || null,
        }),
        ...(validAlignment && { alignment: validAlignment }),
        ...(isVideo !== undefined && { isVideo: Boolean(isVideo) }),
        ...(betChance !== undefined && {
          betChance: betChance ? parseInt(betChance) : null,
        }),
        ...(primaryButtonText !== undefined && {
          primaryButtonText: primaryButtonText || null,
        }),
        ...(primaryButtonLink !== undefined && {
          primaryButtonLink: primaryButtonLink || null,
        }),
        ...(secondaryButtonText !== undefined && {
          secondaryButtonText: secondaryButtonText || null,
        }),
        ...(secondaryButtonLink !== undefined && {
          secondaryButtonLink: secondaryButtonLink || null,
        }),
        ...(validStatus && { status: validStatus }),
        ...(orderIndex !== undefined && {
          orderIndex: parseInt(orderIndex) || 0,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating carousel item:", error);
    return NextResponse.json(
      { error: "Failed to update carousel item" },
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

    // Check if carousel item exists
    const existingItem = await prisma.carouselItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    // Delete the carousel item
    await prisma.carouselItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Carousel item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting carousel item:", error);
    return NextResponse.json(
      { error: "Failed to delete carousel item" },
      { status: 500 }
    );
  }
}
