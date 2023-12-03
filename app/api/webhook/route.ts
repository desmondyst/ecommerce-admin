import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

// IN dev, need to redirect to this route using
// stripe listen --forward-to localhost:3000/api/webhook

// # NOTE: API: https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local
export async function POST(req: Request) {
    // text instead of JSON as this is a webhook

    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        // ! to fix typescript error
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, {
            status: 400,
        });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    // The form has different address components
    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
    ];

    const addressString = addressComponents
        .filter((c) => c !== null)
        .join(", ");

    // https://stripe.com/docs/api/events/types
    if (event.type === "checkout.session.completed") {
        const order = await prismadb.order.update({
            where: {
                // we save as metadata
                id: session?.metadata?.orderId,
            },
            data: {
                isPaid: true,
                address: addressString,
                phone: session?.customer_details?.phone || "",
            },
            include: {
                orderItems: true,
            },
        });

        const productIds = order.orderItems.map(
            (orderItem) => orderItem.productId
        );

        await prismadb.product.updateMany({
            where: {
                id: {
                    in: [...productIds],
                },
            },
            data: {
                isArchived: true,
            },
        });
    }
    return new NextResponse(null, { status: 200 });
}
