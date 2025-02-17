import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getSalesCount } from "@/actions/get-sales-count";
import { getStockCount } from "@/actions/get-stock-count";
import { getTotalRevenue } from "@/actions/get-total-revenue copy";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { CreditCardIcon, DollarSign, PackageIcon } from "lucide-react";
import { Suspense } from "react";
import LandingPageSkeleton from "./landing-fallback-skeleton";

interface DashboardPageProps {
    params: { storeId: string };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
    const totalRevenue = await getTotalRevenue(params.storeId);
    const salesCount = await getSalesCount(params.storeId);
    const stockCount = await getStockCount(params.storeId);
    const graphRevenue = await getGraphRevenue(params.storeId);

    return (
        // NOTE: manually wrapping a suspense because don't want child to inherit loading skeleton
        <Suspense fallback={<LandingPageSkeleton />}>
            <div className="flex-col">
                {/* It is used to set the flex property to 1, which means the flex container or item will take up all available space along the main axis. */}
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <Heading
                        title="Dashboard"
                        description="Overview of your store"
                    />
                    <Separator />
                    <div className="grid gap-4 grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground mt-0" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatter.format(totalRevenue)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Sales
                                </CardTitle>
                                <CreditCardIcon className="h-4 w-4 text-muted-foreground mt-0" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {salesCount}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Products In Stock
                                </CardTitle>
                                <PackageIcon className="h-4 w-4 text-muted-foreground mt-0" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stockCount}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview data={graphRevenue} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Suspense>
    );
};

export default DashboardPage;
