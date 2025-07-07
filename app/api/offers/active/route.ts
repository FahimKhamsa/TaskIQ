import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get active offers that are not expired and still active
    const activeOffers = await prisma.offer.findMany({
      where: {
        offerStatus: true,
        OR: [{ expirationDate: null }, { expirationDate: { gte: now } }],
      },
      include: {
        price: true,
        _count: {
          select: {
            offerClaims: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check which offers the user has already claimed
    const userClaims = await prisma.offerClaim.findMany({
      where: { userId: user.id },
      select: { offerId: true },
    });

    const claimedOfferIds = userClaims.map((claim: any) => claim.offerId);

    // Add claim status to each offer
    const offersWithClaimStatus = activeOffers.map((offer: any) => ({
      ...offer,
      isClaimed: claimedOfferIds.includes(offer.id),
      isExpired: offer.expirationDate ? offer.expirationDate < now : false,
    }));

    return NextResponse.json({
      offers: offersWithClaimStatus,
      total: offersWithClaimStatus.length,
    });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
