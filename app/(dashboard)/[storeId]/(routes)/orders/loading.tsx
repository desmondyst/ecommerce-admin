import GeneralSkeleton from "@/components/ui/general-skeleton";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex-col">
            {/* BILLBOARD SECTION SKELETON */}
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    {/* heading skeleton */}
                    <div>
                        <Skeleton className=" h-12 w-48 mb-3" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
                <Separator />
                {/* DataTable search bar skeleton */}
                <Skeleton className="h-12 w-96" />

                {/* Table Skeleton */}
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}
