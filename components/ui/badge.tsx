import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-tag px-4 py-1 text-xs font-bold font-sans tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        green: "bg-[#A8E6CF]/30 text-[#166534] border border-[#A8E6CF]/50",
        terracotta: "bg-[#C4602A]/10 text-[#C4602A] border border-[#C4602A]/20",
        neutral: "bg-[#F5F0E8] text-[#1A1A1A] border border-[#E8E3DB]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
