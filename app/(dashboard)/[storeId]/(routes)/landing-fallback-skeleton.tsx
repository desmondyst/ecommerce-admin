import { Skeleton } from "@/components/ui/skeleton";

const LandingPageSkeleton = () => {
    return (
        <div className="flex-col">
            {/* It is used to set the flex property to 1, which means the flex container or item will take up all available space along the main axis. */}
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    {/* heading skeleton */}
                    <div>
                        <Skeleton className=" h-12 w-48 mb-3" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
                {/* Cards skeleton */}
                <div className="grid gap-4 grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                {/* Chart skeleton */}
                <Skeleton className="h-[27rem]" />
            </div>
        </div>
    );
};

export default LandingPageSkeleton;
