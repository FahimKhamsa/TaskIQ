import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // TODO: Verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // For now, parse the body as JSON (in production, use the verified event)
    const event = JSON.parse(body);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    const { customer, subscription, metadata } = session;
    const userId = metadata?.userId;

    if (!userId) {
      console.error("No userId in checkout session metadata");
      return;
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId },
      data: {
        stripeId: subscription,
        isSubscribed: true,
        startDate: new Date(),
      },
    });

    // Log successful payment
    await prisma.log.create({
      data: {
        userId,
        type: "SUCCESS",
        content: "Payment completed successfully",
        isPremium: true,
      },
    });
  } catch (error) {
    console.error("Error handling checkout completed:", error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    const { customer, subscription } = invoice;

    // Find user by stripe customer ID or subscription ID
    const userSubscription = await prisma.subscription.findFirst({
      where: { stripeId: subscription },
    });

    if (!userSubscription) {
      console.error("No subscription found for stripe ID:", subscription);
      return;
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { id: userSubscription.id },
      data: {
        isSubscribed: true,
        startDate: new Date(),
        endDate: getNextBillingDate(),
      },
    });

    // Log successful payment
    await prisma.log.create({
      data: {
        userId: userSubscription.userId!,
        type: "SUCCESS",
        content: "Subscription payment succeeded",
        isPremium: true,
      },
    });
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const { customer, subscription } = invoice;

    // Find user by stripe subscription ID
    const userSubscription = await prisma.subscription.findFirst({
      where: { stripeId: subscription },
    });

    if (!userSubscription) {
      console.error("No subscription found for stripe ID:", subscription);
      return;
    }

    // Log failed payment
    await prisma.log.create({
      data: {
        userId: userSubscription.userId!,
        type: "ERROR",
        content: "Subscription payment failed",
        isPremium: false,
      },
    });

    // TODO: Send payment failure notification email
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const { id, status, current_period_end } = subscription;

    // Find user subscription
    const userSubscription = await prisma.subscription.findFirst({
      where: { stripeId: id },
    });

    if (!userSubscription) {
      console.error("No subscription found for stripe ID:", id);
      return;
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { id: userSubscription.id },
      data: {
        isSubscribed: status === "active",
        endDate: new Date(current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { id } = subscription;

    // Find user subscription
    const userSubscription = await prisma.subscription.findFirst({
      where: { stripeId: id },
    });

    if (!userSubscription) {
      console.error("No subscription found for stripe ID:", id);
      return;
    }

    // Update to free plan
    await prisma.subscription.update({
      where: { id: userSubscription.id },
      data: {
        plan: "FREE",
        isSubscribed: false,
        endDate: new Date(),
        stripeId: null,
      },
    });

    // Reset credits to free tier
    await prisma.credit.update({
      where: { userId: userSubscription.userId! },
      data: {
        dailyLimit: 10,
        usedToday: 0,
        lastUpdated: new Date(),
      },
    });

    // Log cancellation
    await prisma.log.create({
      data: {
        userId: userSubscription.userId!,
        type: "INFO",
        content: "Subscription cancelled via Stripe",
        isPremium: false,
      },
    });
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}

function getNextBillingDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}
