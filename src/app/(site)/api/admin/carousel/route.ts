import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { CarouselAlignment, CarouselStatus } from "@prisma/client";

export async function GET() {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const carouselItems = await prisma.carouselItem.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items: carouselItems });
  } catch (error) {
    console.error("Error fetching carousel items:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    // Validate required fields
    const {
      title,
      subtitle,
      date,
      description,
      imageSrc,
      marketId,
      useSocialImage = false,
      mobileBannerSrc,
      alignment = "LEFT",
      isVideo = false,
      betChance,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      status = "DRAFT",
      orderIndex = 0,
    } = body;

    if (!imageSrc) {
      return NextResponse.json(
        {
          error: "Missing required field: imageSrc",
        },
        { status: 400 }
      );
    }

    // Validate alignment enum
    const validAlignment = alignment.toUpperCase() as CarouselAlignment;
    if (!Object.values(CarouselAlignment).includes(validAlignment)) {
      return NextResponse.json(
        { error: "Invalid alignment value. Must be LEFT or CENTER" },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatus = status.toUpperCase() as CarouselStatus;
    if (!Object.values(CarouselStatus).includes(validStatus)) {
      return NextResponse.json(
        {
          error: "Invalid status value. Must be DRAFT, PUBLISHED, or ARCHIVED",
        },
        { status: 400 }
      );
    }

    // Create the carousel item
    const carouselItem = await prisma.carouselItem.create({
      data: {
        title,
        subtitle,
        date,
        description,
        imageSrc,
        marketId: marketId || null,
        useSocialImage: Boolean(useSocialImage),
        mobileBannerSrc: mobileBannerSrc || null,
        alignment: validAlignment,
        isVideo: Boolean(isVideo),
        betChance: betChance ? parseInt(betChance) : null,
        primaryButtonText: primaryButtonText || null,
        primaryButtonLink: primaryButtonLink || null,
        secondaryButtonText: secondaryButtonText || null,
        secondaryButtonLink: secondaryButtonLink || null,
        status: validStatus,
        orderIndex: parseInt(orderIndex) || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        item: carouselItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating carousel item:", error);
    return NextResponse.json(
      { error: "Failed to create carousel item" },
      { status: 500 }
    );
  }
}
