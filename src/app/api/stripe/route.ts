import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // vevify webhook actually came from stripe
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Webhook verification failed", error);
    return NextResponse.json(null, { status: 400 });
  }

  // fulfill order
  switch (event.type) {
    case "checkout.session.completed":
      await prisma.user.update({
        where: {
          email: event.data.object.customer_email,
        },
        data: {
          hasAccess: true,
        },
      });
      break;
    default:
      console.log("handler not found for event type", event.type);
      return NextResponse.json(null, { status: 400 });
  }

  //return 200 OK
  return NextResponse.json(null, { status: 200 });
}
