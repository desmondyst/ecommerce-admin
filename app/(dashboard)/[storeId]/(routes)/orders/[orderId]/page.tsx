import prismadb from "@/lib/prismadb";
import ProductForm from "./components/order-form";

// NOTE: Server component, so you get the params from the function input
const OrderPage = async ({
    params,
}: {
    params: { orderId: string; storeId: string };
}) => {
    const order = await prismadb.order.findUnique({
        where: {
            id: params.orderId,
        },
        // loading the FK images
        include: {
            orderItems: true,
        },
    });

    // const categories = await prismadb.category.findMany({
    //     where: {
    //         storeId: params.storeId,
    //     },
    // });

    // const sizes = await prismadb.size.findMany({
    //     where: {
    //         storeId: params.storeId,
    //     },
    // });

    // const colors = await prismadb.color.findMany({
    //     where: {
    //         storeId: params.storeId,
    //     },
    // });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductForm
                    // categories={categories}
                    // colors={colors}
                    // sizes={sizes}
                    initialData={order}
                />
            </div>
        </div>
    );
};

export default OrderPage;
