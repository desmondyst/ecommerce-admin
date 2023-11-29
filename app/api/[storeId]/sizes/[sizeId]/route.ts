import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: { sizeId: string };
    }
) {
    try {
        const size = await prismadb.size.findUnique({
            where: {
                id: params.sizeId,
            },
        });

        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// # NOTE:you need a {} around params (the one below requests)
export async function PATCH(
    req: Request,
    {
        params,
    }: {
        params: { storeId: string; sizeId: string };
    }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, value } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }
        // server side form validation
        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!value) {
            return new NextResponse("Value is required", { status: 400 });
        }

        if (!params.sizeId) {
            return new NextResponse("Size ID is required", {
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

        const size = await prismadb.size.updateMany({
            where: {
                id: params.sizeId,
            },
            data: {
                name,
                value,
            },
        });

        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    {
        params,
    }: {
        params: { storeId: string; sizeId: string };
    }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        // server side form validation
        if (!params.sizeId) {
            return new NextResponse("Size ID is required", {
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
        const size = await prismadb.size.deleteMany({
            where: {
                id: params.sizeId,
            },
        });

        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
