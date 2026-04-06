"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const [hoverType, setHoverType] = useState<"none" | "clickable" | "image">("none");
  const [isMobile, setIsMobile] = useState(false);
  
  const exactX = useMotionValue(-100);
  const exactY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const circleX = useSpring(exactX, springConfig);
  const circleY = useSpring(exactY, springConfig);

  useEffect(() => {
    // Disable on mobile/touch devices
    if (window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window) {
      setIsMobile(true);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      exactX.set(e.clientX);
      exactY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isImage = target.tagName.toLowerCase() === "img" || 
                      target.tagName.toLowerCase() === "svg" || 
                      target.style.backgroundImage !== "";
                      
      const isClickable = target.tagName.toLowerCase() === "button" ||
                          target.tagName.toLowerCase() === "a" ||
                          target.closest("button") ||
                          target.closest("a") ||
                          target.classList.contains("cursor-pointer");

      if (isImage) {
        setHoverType("image");
      } else if (isClickable) {
        setHoverType("clickable");
      } else {
        setHoverType("none");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [exactX, exactY]);

  if (isMobile) return null;

  return (
    <>
      {/* Exact Tracking Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full bg-[#6BC4A0] mix-blend-difference"
        style={{
          x: exactX,
          y: exactY,
          width: 8,
          height: 8,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: hoverType === "none" ? 1 : 0,
          opacity: hoverType === "none" ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Lagging Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center text-center backdrop-blur-[2px]"
        style={{
          x: circleX,
          y: circleY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hoverType === "none" ? 40 : 60,
          height: hoverType === "none" ? 40 : 60,
          backgroundColor: hoverType === "none" ? "transparent" : "rgba(44, 62, 45, 0.2)",
          border: hoverType === "none" ? "1px solid rgba(107, 196, 160, 0.6)" : "1px solid rgba(107, 196, 160, 0.1)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <AnimatePresence>
          {hoverType === "image" && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[8px] font-bold tracking-widest text-[#F5F0E8] capitalize leading-none"
            >
              VIEW
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
