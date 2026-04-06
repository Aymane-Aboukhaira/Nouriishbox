import { Skeleton } from "@/components/ui/skeleton";

export function MacroBlobSkeleton() {
    return (
        <div className="flex flex-col items-center p-4">
            <Skeleton className="w-[100px] h-[100px] rounded-full mb-3" />
            <Skeleton className="w-16 h-4 mb-2" />
            <Skeleton className="w-12 h-3" />
        </div>
    );
}
