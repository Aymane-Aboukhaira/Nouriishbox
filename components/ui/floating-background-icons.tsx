"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const VEGGIE_ICONS = [
  "/visuals/icons of menu section/carrot icons.png",
  "/visuals/icons of menu section/herbs icons.png",
  "/visuals/icons of menu section/onion icon.png",
  "/visuals/icons of menu section/tomato icon.png",
];

const ICON_ASSETS = [...VEGGIE_ICONS];

interface FloatingBackgroundIconsProps {
  count?: number;
}

export function FloatingBackgroundIcons({ count = 8 }: FloatingBackgroundIconsProps) {
  const [icons, setIcons] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: count }).map((_, i) => ({
      id: i,
      src: ICON_ASSETS[i % ICON_ASSETS.length],
      top: `${5 + Math.random() * 85}%`,
      left: `${5 + Math.random() * 85}%`,
      rotation: Math.random() * 360 - 180,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
      scale: 0.6 + Math.random() * 0.6,
      yOffset: 15 + Math.random() * 15,
    }));
    setIcons(generated);
  }, [count]);

  if (icons.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {icons.map((icon) => {
          return (
            <motion.div
              key={icon.id}
              initial={{ 
                top: icon.top, 
                left: icon.left, 
                rotate: icon.rotation, 
                scale: icon.scale,
                opacity: 0 
              }}
              animate={{ 
                y: [0, -icon.yOffset, 0],
                opacity: 0.12 
              }}
              transition={{
                y: {
                  duration: icon.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: icon.delay,
                },
                opacity: { duration: 1.5, delay: icon.delay }
              }}
              className="absolute"
              style={{ width: "80px", height: "80px" }} 
            >
              <div className="relative w-full h-full">
                <Image
                  src={icon.src}
                  alt="floating asset"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}
