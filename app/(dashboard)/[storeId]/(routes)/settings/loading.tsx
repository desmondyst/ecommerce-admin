import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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

                {/* name input skeleton */}
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-12 w-[36rem]" />

                {/* save changes button */}
                <Skeleton className="h-12 w-32" />
            </div>
            {/* API SECTION SKELETON */}
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* API table heading skeleton */}

                <Separator />

                {/* API ROUTES SKELETON */}
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
}
