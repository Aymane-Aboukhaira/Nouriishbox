"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image, { ImageProps } from "next/image";

export function CinematicImage({ src, alt, className = "", ...props }: ImageProps & { className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });

  useEffect(() => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsMobile(true);
    }
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Mobile: simple fade-in. Desktop: wait for Cinematic wipe */}
      <motion.div
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: isMobile ? 0.3 : 0 }} // Smooth fade on mobile, instant on desktop to let shutter reveal
        className="w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className="object-cover w-full h-full"
          {...props}
        />
      </motion.div>

      {/* Cinematic Green Shutter Reveal — Opted out on mobile for perf */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0 bg-[#2C3E2D] z-10 origin-top pointer-events-none text-[#F5F0E8]"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: isLoaded && isInView ? 0 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      )}
    </div>
  );
}
