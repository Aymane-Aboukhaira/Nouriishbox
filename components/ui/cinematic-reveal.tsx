"use client";

import { motion } from "framer-motion";

export function CinematicReveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <div className="relative overflow-hidden w-full h-full">
      {children}
      <motion.div 
        initial={{ scaleY: 1 }}
        whileInView={{ scaleY: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1], delay }}
        style={{ originY: 0 }}
        className="absolute inset-0 bg-[#2C3E2D] z-10 text-[#F5F0E8]"
      />
    </div>
  );
}
