"use client";

import { motion } from "framer-motion";

interface SplitTextLinkProps {
  children: string;
  className?: string;
}

/**
 * On hover: the original text slides up & out,
 * and an identical copy slides in from below —
 * creating the "rolling text" / duplication hover effect.
 */
export function SplitTextLink({ children, className = "" }: SplitTextLinkProps) {
  return (
    <span
      className={`relative inline-flex flex-col overflow-hidden h-[1.2em] ${className}`}
      aria-label={children}
    >
      {/* Original text - slides up on hover */}
      <motion.span
        className="inline-block"
        variants={{
          rest: { y: "0%" },
          hover: { y: "-110%" },
        }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.span>

      {/* Duplicate - starts below, slides up into view */}
      <motion.span
        className="inline-block absolute top-[110%] left-0"
        variants={{
          rest: { y: "0%" },
          hover: { y: "-110%" },
        }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        aria-hidden="true"
      >
        {children}
      </motion.span>
    </span>
  );
}
