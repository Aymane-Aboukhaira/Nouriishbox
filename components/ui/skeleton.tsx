import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-2xl bg-[#F0E4D8]/60", className)}
            {...props}
        />
    )
}

export { Skeleton }
