"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Calculator, Truck, Leaf, Droplet, Wheat } from "lucide-react";
import { useRouter } from "next/navigation";

export function CtaSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this section for the zoom-in effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const textScale = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const bgBorderRadius = useTransform(scrollYProgress, [0, 1], ["20%", "0%"]);

  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, margin: "-100px" });

  const [mounted, setMounted] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (isInView) {

      setTimeout(() => {
        let current = 0;
        const interval = setInterval(() => {
          current++;
          setCounter(current);
          if (current >= 15) clearInterval(interval);
        }, 50);
      }, 1500); // Wait for the calculator to drop before counting
    }
  }, [isInView]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
      {/* Expanding Background Sequence */}
      <motion.div
        className="absolute inset-0 bg-[#2C3E2D] origin-center z-0 text-[#F5F0E8]"
        style={{ scale: bgScale, borderRadius: bgBorderRadius }}
      >
        {/* Animated Noise/Grain Texture Overlay */}
        <div
          className="absolute inset-0 opacity-10 bg-repeat bg-[length:100px_100px] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: "color-burn",
            animation: "noiseAnimation 1s steps(2) infinite"
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes noiseAnimation {
            0% { transform: translate(0,0) }
            10% { transform: translate(-5%,-5%) }
            20% { transform: translate(-10%,5%) }
            30% { transform: translate(5%,-10%) }
            40% { transform: translate(-5%,15%) }
            50% { transform: translate(-10%,5%) }
            60% { transform: translate(15%,0) }
            70% { transform: translate(0,10%) }
            80% { transform: translate(-15%,0) }
            90% { transform: translate(10%,5%) }
            100% { transform: translate(5%,0) }
          }
        `}} />
      </motion.div>

      {/* Floating Food Particles in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {mounted && Array.from({ length: 20 }).map((_, i) => {
          const Icon = i % 3 === 0 ? Leaf : i % 3 === 1 ? Droplet : Wheat;
          return (
            <motion.div
              key={i}
              className="absolute text-[#F5F0E8]/10"
              initial={{ y: "110vh", x: `${Math.random() * 100}vw`, rotate: 0, scale: 0.5 + Math.random() }}
              animate={{ y: "-20vh", rotate: 360 }}
              transition={{
                duration: 15 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 15
              }}
            >
              <Icon size={32} />
            </motion.div>
          );
        })}
      </div>

      <div ref={contentRef} className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center">

        {/* Small Invitation Tag */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="font-serif italic text-sm md:text-lg text-[#F5F0E8]/70 mb-4 tracking-wide"
        >
        </motion.p>

        {/* Massive Zoom-In Text */}
        <motion.h2
          style={{ scale: textScale }}
          className="font-serif font-bold text-[clamp(2.5rem,7vw,8rem)] leading-[0.9] text-[#F5F0E8] capitalize tracking-tight w-full mb-16 origin-center"
        >
          <span dangerouslySetInnerHTML={{ __html: "VOTRE CORPS, <br/> VOS <span class='text-[#C4602A]'>RÈGLES.</span>" }} />
        </motion.h2>

        {/* Animations Container: Truck & Calculator */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-40 w-full mt-10">

          {/* Truck Driving Animation */}
          <div className="relative w-64 h-32 flex flex-col items-center justify-end overflow-visible">
            {/* Truck Element */}
            <motion.div
              initial={{ x: "-200vw" }}
              animate={isInView ? { x: 0 } : { x: "-200vw" }}
              transition={{ type: "spring", stiffness: 40, damping: 12, mass: 1, delay: 0.3 }}
              className="relative text-[#F5F0E8] z-10"
            >
              <Truck size={100} strokeWidth={1} />
            </motion.div>

            {/* Scrolling Road Line */}
            <div className="absolute bottom-0 w-[200%] h-2 overflow-hidden left-0">
              <motion.div
                className="w-full h-full border-b-[6px] border-dashed border-[#FAFAF7]/40"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Calculator Drop Animation */}
          <div className="relative w-40 flex items-center justify-center">
            <motion.div
              initial={{ y: "-100vh", rotate: -45 }}
              animate={isInView ? { y: 0, rotate: -5 } : { y: "-100vh", rotate: -45 }}
              transition={{ type: "spring", bounce: 0.6, duration: 1.5, delay: 0.8 }}
              className="bg-[#F5F0E8] text-[#1A1A1A] p-6 rounded-[20px] shadow-2xl flex flex-col items-center justify-center border-4 border-[#C4602A] relative z-10 w-48"
            >
              <Calculator size={56} className="mb-4 text-[#C4602A]" strokeWidth={1.5} />
              <div className="font-display text-5xl leading-none font-bold tabular-nums tracking-tighter">
                {counter}%
              </div>
              <div className="text-xs font-bold tracking-widest mt-3 capitalize text-center text-[#2C3E2D]" dangerouslySetInnerHTML={{ __html: "Gains en<br/>Temps & Énergie" }} />
            </motion.div>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-20 relative group inline-flex flex-col items-center">
          <div className="relative group inline-block">
            {/* Conic Gradient Hover Effect */}
            <div className="absolute -inset-1 rounded-[100px] bg-[conic-gradient(from_0deg,#2C3E2D,#C4602A,#F5F0E8,#2C3E2D)] opacity-0 group-hover:opacity-100 animate-[spin_2s_linear_infinite] blur-md transition-opacity duration-300 z-0 pointer-events-none" />

            <button
              onClick={() => router.push("/onboarding")}
              className="relative bg-[#F5F0E8] text-[#2C3E2D] px-14 md:px-24 py-6 md:py-8 rounded-[100px] text-lg md:text-2xl font-bold font-sans transition-all overflow-hidden capitalize tracking-widest z-10 group-hover:scale-105 active:scale-95 shadow-xl"
            >
              COMMENCER L&apos;EXPÉRIENCE
            </button>
          </div>

          {/* Powered by Pill Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-[#1B281C] text-[#F5F0E8] px-6 py-2 rounded-[100px] border border-[#2C3E2D] text-[10px] font-sans font-bold tracking-[0.2em] uppercase"
          >
            PROPULSÉ PAR LA SCIENCE NUTRITIONNELLE
          </motion.div>
        </div>

      </div>
    </section>
  );
}
