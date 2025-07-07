import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (type) {
      whereClause.offerType = type;
    }

    if (status !== "") {
      whereClause.offerStatus = status === "true";
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          price: true,
          _count: {
            select: {
              offerClaims: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.offer.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check for creating offers

    const body = await request.json();
    const {
      priceId,
      offerType,
      offerName,
      offerStatus = true,
      expirationDate,
    } = body;

    if (!offerName || !offerType) {
      return NextResponse.json(
        { error: "Offer name and type are required" },
        { status: 400 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        priceId,
        offerType,
        offerName,
        offerStatus,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        totalClaimed: 0,
        createdAt: new Date(),
      },
      include: {
        price: true,
      },
    });

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Created offer: ${offerName}`,
        isPremium: true,
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
