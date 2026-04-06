"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref as any}
        whileHover={hoverEffect ? { y: -4, scale: 1.005 } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "rounded-card bg-surface p-6 shadow-card border border-border transition-shadow",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export { Card };
