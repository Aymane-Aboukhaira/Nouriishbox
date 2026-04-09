"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useInView,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

// ─── Particle field ───────────────────────────────────────────────────────────
type Particle = { x: number; y: number; vx: number; vy: number; r: number };

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: 70 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.4,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196, 96, 42, 0.35)";
        ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Neon donut chart ─────────────────────────────────────────────────────────
function NeonDonut({
  value,
  color,
  label,
  delayIdx,
}: {
  value: number;
  color: string;
  label: string;
  delayIdx: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  // Odometer count-up
  useEffect(() => {
    if (!inView) return;
    const delay = delayIdx * 180;
    const timeout = setTimeout(() => {
      let cur = 0;
      const step = () => {
        cur++;
        setDisplay(cur);
        if (cur < value) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [inView, value, delayIdx]);

  const R = 44;
  const CIRC = 2 * Math.PI * R;
  const progress = inView ? value / 100 : 0;

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="#2A2A2A" strokeWidth="10" />
          {/* Animated fill stroke */}
          <motion.circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={inView ? { strokeDashoffset: CIRC * (1 - progress) } : {}}
            transition={{ duration: 1.0, ease: "easeOut", delay: delayIdx * 0.18 }}
          />
        </svg>

        {/* Odometer number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <OdometerNumber value={display} />
          <span className="font-sans font-medium text-white capitalize text-[10px] mt-1 tracking-[0.1em]">{label}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Odometer / slot-machine digit roll ───────────────────────────────────────
function OdometerNumber({ value }: { value: number }) {
  const digits = String(value).padStart(2, "0").split("");
  return (
    <div className="flex items-end leading-none overflow-hidden" style={{ height: "1.5rem" }}>
      {digits.map((d, i) => (
        <div key={i} className="relative overflow-hidden h-6 w-[0.6rem]">
          <motion.div
            key={d}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center font-serif text-xl font-bold text-white"
          >
            {d}
          </motion.div>
        </div>
      ))}
      <span className="font-serif font-bold text-white text-sm ml-0.5" style={{ lineHeight: "1.4" }}>%</span>
    </div>
  );
}

// ─── Typewriter bullet ────────────────────────────────────────────────────────
function TypewriterBullets({ active }: { active: boolean }) {
  const BULLETS = [
    {
      title: "Algorithme",
      desc: "Notre moteur de calcul utilise des équations validées cliniquement pour identifier vos besoins macronutritionnels quotidiens optimaux basés strictement sur vos métriques personnelles.",
    },
    {
      title: "Personnalisé",
      desc: "Votre menu est instantanément adapté à ces exigences exactes. Fini les régimes génériques—uniquement ce dont votre corps a réellement besoin.",
    },
    {
      title: "Misé sur les données",
      desc: "Nous ajustons votre distribution de macronutriments dynamiquement semaine après semaine pour garantir une adaptation constante.",
    },
  ];
  const [revealed, setRevealed] = useState(0); // how many bullets are fully typed
  const [charIdx, setCharIdx] = useState(0);   // char position in current bullet
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!active) return;
    if (revealed >= BULLETS.length) return;

    const current = BULLETS[revealed];
    const fullText = `${current.title}: ${current.desc}`;

    if (charIdx < fullText.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 18);
      return () => clearTimeout(t);
    } else {
      // pause then move to next bullet
      const t = setTimeout(() => {
        setRevealed((r) => r + 1);
        setCharIdx(0);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [active, revealed, charIdx]);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-8 bg-white/5 rounded-[20px] p-8 md:p-10 border border-white/10 backdrop-blur-sm">
      {BULLETS.map((b, i) => {
        const fullText = `${b.title}: ${b.desc}`;
        const isActive = i === revealed;
        const isDone = i < revealed;

        let displayText = "";
        if (isDone) displayText = fullText;
        else if (isActive) displayText = fullText.slice(0, charIdx);

        if (!isDone && !isActive) return null;

        return (
          <div key={i} className="ps-6 border-s-2 border-[#C4602A]">
            {isDone ? (
              <>
                <h3 className="font-serif font-semibold text-xl text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-[#F5F0E8]/75 font-sans font-normal leading-[1.7] text-base">{b.desc}</p>
              </>
            ) : (
              <p className="font-sans text-base text-[#F5F0E8]/75 leading-relaxed min-h-[3em]">
                <span className="text-white font-serif font-semibold text-xl block mb-2">{displayText.slice(0, b.title.length)}</span>
                <span>{displayText.slice(b.title.length)?.replace(/^:\s*/, "")}</span>
                {isActive && (
                  <span
                    className="inline-block w-[2px] h-[1em] bg-white ml-0.5 align-middle"
                    style={{ opacity: showCursor ? 1 : 0 }}
                  />
                )}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Electric pulse flow ──────────────────────────────────────────────────────
function ElectricFlow({ active }: { active: boolean }) {
  const STEPS = [
    { label: "Données", icon: "⬡" },
    { label: "Algorithme", icon: "◈" },
    { label: "Préparation",  icon: "◉" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 w-full mt-4">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          {/* Step node */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={active ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: i * 0.3, duration: 0.4, type: "spring" }}
            className="flex flex-col items-center gap-2 w-20"
          >
            <div
              className="w-14 h-14 border border-[#C4602A] flex items-center justify-center text-2xl text-[#C4602A] rounded-[16px]"
              style={{
                boxShadow: active ? `0 0 12px rgba(196,96,42,0.4)` : "none",
              }}
            >
              {step.icon}
            </div>
            <span className="font-display text-[10px] tracking-[0.2em] text-white/60 capitalize text-center">
              {step.label}
            </span>
          </motion.div>

          {/* Connector with traveling pulse */}
          {i < STEPS.length - 1 && (
            <div className="relative w-16 h-[2px] bg-[#333] mx-1 shrink-0">
              {/* Static line */}
              <motion.div
                className="absolute inset-0 bg-[#C4602A]/30"
                initial={{ scaleX: 0 }}
                animate={active ? { scaleX: 1 } : {}}
                style={{ originX: 0 }}
                transition={{ delay: i * 0.3 + 0.4, duration: 0.4 }}
              />
              {/* Traveling dot — loops */}
              {active && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C4602A]"
                  style={{
                    boxShadow: "0 0 8px #C4602A, 0 0 16px #C4602A",
                    left: 0,
                  }}
                  animate={{ x: [0, 56, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                    repeatDelay: 0.4,
                  }}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function ScienceSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-32 px-6 bg-[#1A1A1A] text-white overflow-hidden"
    >
      {/* Particle field */}
      <ParticleField />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Heading ── */}
        <div className="mb-20">
          <h2 className="font-serif font-bold capitalize leading-[0.9] tracking-tight">
            <span className="text-[clamp(3.5rem,8vw,7rem)] text-white block">
              Macros Rendues
            </span>
            {/* "Simple" — outlined only, no fill */}
            <span
              className="text-[clamp(3.5rem,8vw,7rem)] block"
              style={{
                WebkitTextStroke: "2px #FFFFFF",
                color: "transparent",
              }}
            >
              Simples.
            </span>
          </h2>
          <p className="mt-6 font-sans font-medium text-[#F5F0E8] text-xl max-w-md leading-[1.6]">
            Nutrition précise, Zéro supposition.
          </p>
        </div>

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* LEFT — typewriter bullets */}
          <div>
            <TypewriterBullets active={inView} />
          </div>

          {/* RIGHT — donuts + electric flow */}
          <div className="flex flex-col items-center gap-16">
            {/* Donut charts */}
            <div className="flex flex-wrap justify-center gap-10">
              <NeonDonut value={50} color="#C4602A" label="Protéines" delayIdx={0} />
              <NeonDonut value={40} color="#F5F0E8" label="Lipides"     delayIdx={1} />
              <NeonDonut value={30} color="#6BC4A0" label="Glucides"   delayIdx={2} />
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4602A]/40 to-transparent" />

            {/* Electric process flow */}
            <div className="w-full">
              <p className="font-display text-xs tracking-[0.3em] text-white/30 capitalize mb-6 text-center">
                Pipeline de Données
              </p>
              <ElectricFlow active={inView} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
