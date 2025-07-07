import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const body = await request.json();
    const { offerId } = body;

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    // Check if offer exists and is active
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { price: true },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (!offer.offerStatus) {
      return NextResponse.json(
        { error: "Offer is not active" },
        { status: 400 }
      );
    }

    // Check if offer is expired
    if (offer.expirationDate && offer.expirationDate < new Date()) {
      return NextResponse.json({ error: "Offer has expired" }, { status: 400 });
    }

    // Check if user has already claimed this offer
    const existingClaim = await prisma.offerClaim.findFirst({
      where: {
        offerId,
        userId: user.id,
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "You have already claimed this offer" },
        { status: 409 }
      );
    }

    // Create the claim
    const claim = await prisma.offerClaim.create({
      data: {
        offerId,
        userId: user.id,
        createdAt: new Date(),
      },
      include: {
        offer: {
          include: {
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Update offer's total claimed count
    await prisma.offer.update({
      where: { id: offerId },
      data: {
        totalClaimed: {
          increment: 1,
        },
      },
    });

    // Apply offer benefits based on offer type
    await applyOfferBenefits(user.id, offer);

    // Log the claim
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "SUCCESS",
        content: `Claimed offer: ${offer.offerName}`,
        isPremium: true,
      },
    });

    return NextResponse.json({
      success: true,
      claim,
      message: `Successfully claimed offer: ${offer.offerName}`,
    });
  } catch (error) {
    console.error("Error claiming offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function applyOfferBenefits(userId: string, offer: any) {
  try {
    switch (offer.offerType) {
      case "CREDIT_BONUS":
        // Add bonus credits
        await prisma.credit.update({
          where: { userId },
          data: {
            dailyLimit: {
              increment: 50, // Bonus credits
            },
            lastUpdated: new Date(),
          },
        });
        break;

      case "TRIAL":
        // Upgrade to trial subscription
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: "PRO",
            isSubscribed: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
          },
          create: {
            userId,
            plan: "PRO",
            isSubscribed: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
          },
        });
        break;

      case "DISCOUNT":
      case "PROMO":
        // These would typically be applied during checkout
        // For now, just log the benefit
        await prisma.log.create({
          data: {
            userId,
            type: "INFO",
            content: `${offer.offerType} offer claimed: ${offer.offerName}`,
            isPremium: true,
          },
        });
        break;

      default:
        console.log(`Unknown offer type: ${offer.offerType}`);
    }
  } catch (error) {
    console.error("Error applying offer benefits:", error);
  }
}
