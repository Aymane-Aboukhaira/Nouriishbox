import { Skeleton } from "@/components/ui/skeleton";

export function MealCardSkeleton() {
    return (
        <div
            className="flex flex-col p-4 rounded-[20px] bg-white"
            style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
        >
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-5 mb-2" />
            <Skeleton className="w-full h-3 mb-1" />
            <Skeleton className="w-5/6 h-3 mb-4" />
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#F0E4D8]">
                <Skeleton className="w-10 h-6 rounded-full" />
                <Skeleton className="w-10 h-6 rounded-full" />
                <Skeleton className="w-10 h-6 rounded-full" />
            </div>
        </div>
    );
}
