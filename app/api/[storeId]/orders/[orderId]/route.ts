import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: { orderId: string };
    }
) {
    try {
        const order = await prismadb.order.findUnique({
            where: {
                id: params.orderId,
            },
            include: {
                orderItems: true,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.log("[ORDER_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// # NOTE:you need a {} around params (the one below requests)
export async function PATCH(
    req: Request,
    {
        params,
    }: {
        params: { storeId: string; orderId: string };
    }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        let { phone, address, isPaid } = body;

        if (isPaid === "Paid") {
            isPaid = true;
        } else if (isPaid === "Not Paid") {
            isPaid = false;
        }

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }
        // server side form validation
        if (!phone) {
            return new NextResponse("Phone is required", { status: 400 });
        }

        if (!address) {
            return new NextResponse("Address is required", { status: 400 });
        }

        if (isPaid === "") {
            return new NextResponse("Is Paid is required", { status: 400 });
        }

        // prevent user from modifying stores that are not theirs
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // NOTE: update all the other fields other than images and clear the images
        const order = await prismadb.order.update({
            where: {
                id: params.orderId,
            },
            data: {
                phone,
                address,
                isPaid,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.log("[ORDER_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    {
        params,
    }: {
        params: { storeId: string; orderId: string };
    }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        // server side form validation
        if (!params.orderId) {
            return new NextResponse("Order ID is required", {
                status: 400,
            });
        }

        // prevent user from modifying stores that are not theirs
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // NOTE: Using deleteMany because userID is not unique according to ..
        const order = await prismadb.order.deleteMany({
            where: {
                id: params.orderId,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.log("[ORDER_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
