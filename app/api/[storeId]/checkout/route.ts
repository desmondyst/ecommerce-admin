import Stripe from "stripe";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

// we need this as the frontend and admin are on different hosts
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Help to deal with CORS from the store to the backend
// In the context of CORS, handling the HTTP OPTIONS method is crucial because browsers send an OPTIONS request as a preflight check before making certain types of cross-origin requests.
export async function OPTIONS() {
    // body: This parameter represents the content of the response body. It can be any valid JSON-serializable object, such as an object, array, string, or number. In your example, an empty object ({}) is provided as the body, indicating that the response body will be an empty JSON object.

    // options: This parameter is an optional object that allows you to specify additional options for the response. In your example, it includes a headers property, where CORS headers ("Access-Control-Allow-Origin", "Access-Control-Allow-Methods", and "Access-Control-Allow-Headers") are provided.

    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    // sent from frontend store upon checkout
    const { productIds } = await req.json();

    if (!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 });
    }

    // find all the products with these ids
    const products = await prismadb.product.findMany({
        where: {
            id: {
                in: productIds,
            },
        },
    });

    const archivedProducts = products.filter((p) => p.isArchived === true);

    // if there is unavailable (archived products), then --> tell the end user
    if (archivedProducts.length > 0 || products.length !== productIds.length) {
        return NextResponse.json(
            "Some of the products are no longer available.",
            { status: 404 }
        );
    }

    // line_items: A list of items the user is purchasing

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // #NOTE: API: https://stripe.com/docs/api/checkout/sessions/create
    // Scroll to line_items, and click `show child parameters`
    // can do the same to expand for product_data
    products.forEach((product) => {
        line_items.push({
            quantity: 1,
            price_data: {
                // NOTE: currency is set here
                currency: "SGD",
                product_data: {
                    // The product’s name, meant to be displayable to the customer.
                    name: product.name,
                },
                // unit_amount is in cents so * 100
                unit_amount: product.price.toNumber() * 100,
            },
        });
    });

    // Example from Prisma Website
    // const userAndPosts = await prisma.user.create({
    //     data: {
    //         posts: {
    //           create: [
    //             { title: 'Prisma Day 2020' }, // Populates authorId with user's id
    //             { title: 'How to write a Prisma schema' }, // Populates authorId with user's id
    //           ],
    //         },
    //       },
    //     })

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: productIds.map((productId: string) => ({
                    product: {
                        // product: { connect: { id: productId } }: This sets up a connection to the product table in the database. It uses the id of each product in productIds to establish the connection. This assumes that there is a foreign key relationship between orderItems and product tables in your database schema.
                        connect: {
                            id: productId,
                        },
                    },
                })),
            },
        },
    });

    // # API: NOTE: https://stripe.com/docs/checkout/quickstart
    const session = await stripe.checkout.sessions.create({
        // esssentially doing line_items: line_items
        line_items,
        mode: "payment",
        billing_address_collection: "required",
        phone_number_collection: {
            enabled: true,
        },
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
        metadata: {
            orderId: order.id,
        },
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
}
