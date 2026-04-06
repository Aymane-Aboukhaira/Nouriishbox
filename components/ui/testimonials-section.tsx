"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

// The infinite scrolling feed
function InfiniteFeed() {
  const controls = useAnimationControls();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      controls.stop();
    } else {
      controls.start({
        y: ["0%", "-50%"],
        transition: {
          ease: "linear",
          duration: 20,
          repeat: Infinity,
        },
      });
    }
  }, [isHovered, controls]);

  const items = [
    { username: "@fitness_sarah", caption: "Obsessed with the Atlas Salmon Bowl!" },
    { username: "@marcos_daily", caption: "Zero guesswork, perfectly matched to my training." },
    { username: "@lena_eats", caption: "The Moroccan spices on this tagine are incredible." },
    { username: "@coach_dave", caption: "Fueling my PRs with Nourishbox this week." },
  ];

  // duplicate items to create seamless loop
  const displayItems = [...items, ...items];

  return (
    <div 
      className="relative h-[600px] overflow-hidden rounded-[20px] bg-white/20 backdrop-blur-sm border border-white/40 shadow-inner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={controls}
        className="flex flex-col gap-6 p-6"
      >
        {displayItems.map((item, idx) => (
          <motion.div 
            key={idx} 
            className="flex flex-col gap-3 group shrink-0"
          >
            {/* Polaroid image container */}
            <motion.div 
              whileHover={{ 
                scale: 1.05, 
                rotate: (idx % 2 === 0 ? 2 : -2),
                padding: 12,
                backgroundColor: "#ffffff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                borderColor: "transparent"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full aspect-square relative bg-[#FAFAF7] border border-[#2C3E2D]/10 overflow-hidden flex items-center justify-center text-center cursor-pointer shadow-sm rounded-[16px]"
            >
              <div className="w-full h-full bg-[#E2725B]/10 flex items-center justify-center px-4">
                <span className="text-[10px] md:text-xs text-[#1A1A1A] font-bold capitalize tracking-widest z-10 transition-transform group-hover:scale-110">
                  COMMUNITY PHOTO
                </span>
              </div>
            </motion.div>
            <div>
              <p className="font-sans font-medium tracking-wide text-[#1A1A1A] group-hover:text-[#C4602A] cursor-pointer inline-block transition-colors lowercase text-sm">
                {item.username}
              </p>
              <p className="text-sm text-[#1A1A1A]/70 font-sans mt-0.5 leading-snug">
                {item.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {/* Top/bottom gradient fades for smooth scrolling effect */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
    </div>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    { 
      name: "Sarah M.", 
      rotate: -2.5, 
      align: "self-start", 
      text: `"The meals are consistently incredible. As an athlete, knowing my macros are precisely hit every single delivery completely transforms my training schedule."` 
    },
    { 
      name: "David L.", 
      rotate: 1.5, 
      align: "self-end", 
      text: `"The zero-waste Sunday lock means I never have to worry about meal prep anymore. Everything arrives fresh, perfect, and genuinely delicious."` 
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden animate-gradient-morph w-full">
      {/* Mosaic Tiles floating in BG */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{ opacity: [0.1, 0.4, 0.1] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-[10%] left-[5%] w-72 h-72 bg-[#E2725B] rounded-full mix-blend-multiply filter blur-[80px]" 
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.5, 0.1] }} 
          transition={{ duration: 7, repeat: Infinity, delay: 1, ease: "easeInOut" }} 
          className="absolute top-[40%] right-[10%] w-96 h-96 bg-[#6BC4A0] rounded-full mix-blend-multiply filter blur-[100px]" 
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "easeInOut" }} 
          className="absolute bottom-[10%] left-[30%] w-80 h-80 bg-[#C4602A] rounded-full mix-blend-multiply filter blur-[90px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center">
        
        {/* Section Heading mixing font weights */}
        <h2 className="mb-24 text-center leading-[1.1] flex flex-wrap items-baseline justify-center gap-x-4">
          <span className="font-serif font-black text-5xl md:text-[5.5rem] text-[#1A1A1A]">Testimonials</span>
          <span className="font-serif font-light italic text-4xl md:text-[4.5rem] text-[#C4602A]">&</span>
          <span 
            className="font-sans font-bold capitalize text-[2rem] md:text-[3.5rem] tracking-tight"
            style={{ WebkitTextStroke: "1px #1A1A1A", color: "transparent" }}
          >
            Community Shared
          </span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 w-full">
          {/* LEFT COLUMN: Scattered Testimonials */}
          <div className="flex flex-col gap-10 justify-center">
            {testimonials.map((t, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, scale: 0.9, rotate: t.rotate }}
                 whileInView={{ opacity: 1, scale: 1, rotate: t.rotate }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ delay: 0.2 + (idx * 0.15), duration: 0.6, type: "spring", stiffness: 100 }}
                 whileHover={{ 
                   y: -10, 
                   rotate: 0, 
                   scale: 1.02,
                   boxShadow: "0 25px 50px -12px rgba(26,26,26,0.15)" 
                 }}
                 className={`bg-[#FAFAF7] p-8 md:p-10 rounded-[24px] shadow-lg w-full max-w-lg cursor-pointer border border-[#2C3E2D]/5 flex-col ${t.align}`}
                 style={{ transformOrigin: "center center" }}
               >
                 <div className="flex items-center gap-5 mb-6">
                   <div className="w-14 h-14 bg-[#2C3E2D] rounded-full flex items-center justify-center text-[10px] font-bold text-[#F5F0E8] text-center capitalize tracking-widest leading-tight shrink-0 shadow-inner">
                     {t.name.substring(0,2).toUpperCase()}
                   </div>
                   <div>
                     {/* Shooting star animation */}
                     <motion.div 
                       initial="hidden" whileInView="show" viewport={{ once: true }}
                       variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 + (idx * 0.15) } } }}
                       className="flex text-[#C4602A] gap-1"
                     >
                       {[...Array(5)].map((_, j) => (
                         <motion.div 
                           key={j} 
                           variants={{ 
                             hidden: { opacity: 0, x: -30, rotate: -45 }, 
                             show: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } } 
                           }}
                         >
                           <Star size={18} fill="currentColor" />
                         </motion.div>
                       ))}
                     </motion.div>
                     <p className="font-serif text-[#1A1A1A] font-bold text-sm tracking-wide mt-2">
                       {t.name}
                     </p>
                   </div>
                 </div>
                 <p className="text-[#1A1A1A]/80 font-sans font-medium text-lg italic leading-[1.6]">
                   {t.text}
                 </p>
               </motion.div>
            ))}
          </div>

          {/* RIGHT COLUMN: Community Feed */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <h3 className="font-sans font-bold text-xs text-[#1A1A1A]/50 mb-6 border-b border-[#1A1A1A]/10 pb-4 uppercase tracking-[0.3em] flex items-center justify-between">
                <span>Live Feed</span>
                <span className="flex items-center gap-2 text-[#C4602A]">
                  <span className="w-2 h-2 rounded-full bg-[#C4602A] animate-pulse" />
                  Live
                </span>
              </h3>
              <InfiniteFeed />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
