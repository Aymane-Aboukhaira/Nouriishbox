"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants, useInView, useScroll, useTransform } from "framer-motion";
import {
  Menu, X, Star, ChevronDown, CheckCircle2,
  Leaf, Flame, Truck, PauseCircle, ArrowRight, Instagram, Facebook
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useMealsStore } from "@/lib/store";
import { MealCard } from "@/components/ui/meal-card";
import { MacroBlob } from "@/components/ui/macro-blob";
import { CinematicReveal } from "@/components/ui/cinematic-reveal";
import { HeroSection } from "@/components/ui/hero-section";
import { ExperienceSection } from "@/components/ui/experience-section";
import { ScienceSection } from "@/components/ui/science-section";
import { MenuSection } from "@/components/ui/menu-section";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { CtaSection } from "@/components/ui/cta-section";
import { FaqSection } from "@/components/ui/faq-section";
import { PricingSection } from "@/components/ui/pricing-section";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const FAQs = [
  { q: "Can I pause or cancel my subscription?", a: "Absolutely. You can pause or cancel your subscription at any time with zero hidden fees. Just do it before the weekly cutoff." },
  { q: "How are my macros calculated?", a: "We use the clinically validated Mifflin-St Jeor equation, modified by your unique activity level and goals (fat loss, maintenance, or muscle gain)." },
  { q: "Do you deliver outside Casablanca?", a: "Currently, we only operate within Casablanca to guarantee the absolute freshness of our daily deliveries." },
  { q: "Can I choose specific meals or is it automatic?", a: "Both! We automatically generate a perfect menu based on your macros, but you can swap any meal easily in your weekly planner." },
  { q: "Are meals suitable for the whole family?", a: "Yes. Our Family Plan lets you set individual profiles and portions for your partner and kids, delivered together." },
  { q: "What if I have allergies?", a: "During onboarding, you can specify preferences like Vegan, Gluten-Free, or specific allergies, and we'll automatically filter your menu." }
];

function AnimatedDonut({ value, color, label, delayIdx }: { value: number, color: string, label: string, delayIdx: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
         let start = 0;
         const interval = setInterval(() => {
            start += 1;
            setPercent((p) => Math.min(p + 1, value));
            if (start >= value) clearInterval(interval);
         }, 800 / value);
      }, delayIdx * 150);
    }
  }, [isInView, value, delayIdx]);

  return (
    <div ref={ref} className="relative w-28 h-28 rounded-full flex items-center justify-center bg-[#2C3440] shadow-lg">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3F4A5A" strokeWidth="16" />
        <motion.circle 
          cx="50" cy="50" r="40" 
          fill="transparent" stroke={color} strokeWidth="16" 
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: value / 100 } : { pathLength: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: delayIdx * 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span className="text-white font-bold text-lg leading-none">{percent}%</span>
        <span className="text-[#9C9C9C] text-[9px] capitalize tracking-wider mt-1">{label}</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { meals } = useMealsStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("Featured");

  const menuMeals = [
    { id: 1, name: "Tangerine Harissa Salmon Bowl", tags: ["GF", "Protein"], type: "Protein" },
    { id: 2, name: "Keto Salmon Stir-Fry", tags: ["GF", "Keto"], type: "Keto" },
    { id: 3, name: "Vegan Tagine", tags: ["Vegan"], type: "Vegan" },
    { id: 4, name: "Protein Power Pancakes", tags: ["Protein"], type: "Protein" },
    { id: 5, name: "Atlas Salmon Bowl", tags: ["GF", "Featured"], type: "Featured" },
    { id: 6, name: "Protein Power Pancake", tags: ["Protein"], type: "Protein" },
    { id: 7, name: "Keto Salmon Stir-Fry", tags: ["GF", "Keto"], type: "Keto" },
    { id: 8, name: "Vegan Tagine", tags: ["Vegan"], type: "Vegan" },
  ];

  const filteredMeals = activeFilter === "Featured" 
    ? menuMeals 
    : menuMeals.filter(m => m.type === activeFilter || m.tags.includes(activeFilter));

  const previewMeals = meals.slice(0, 6);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headlineText = "Nutrition built for you, delivered to your door".split(" ");

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden selection:bg-[#A8E6CF] selection:text-[#166534]">
      <SmoothScroll>
        {/* 1. STICKY NAVBAR */}
        <PublicNavbar />

        {/* 2. HERO SECTION — CINEMATIC */}
        <HeroSection onStart={() => router.push("/onboarding")} />

        {/* 3. FEATURE STRIP */}
        <section className="py-10 px-6 border-y border-[#C4602A] bg-[#1A1A1A] text-[#F5F0E8]">
          <div className="max-w-7xl mx-auto flex overflow-x-auto pb-4 md:pb-0 hide-scrollbar gap-12 md:justify-between items-center snap-x">
            {[
              { icon: Flame, text: "Fresh Daily" },
              { icon: CheckCircle2, text: "Macro-Matched" },
              { icon: Truck, text: "Free Delivery" },
              { icon: PauseCircle, text: "Pause Anytime" },
            ].map((Feature, idx) => (
              <div key={idx} className="flex items-center gap-4 shrink-0 snap-center">
                <div className="text-[#C4602A]">
                  <Feature.icon size={28} strokeWidth={1.5} />
                </div>
                <span className="font-sans font-semibold tracking-wide text-lg text-[#F5F0E8] whitespace-nowrap">{Feature.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. NOURISHBOX EXPERIENCE */}
        <ExperienceSection />

        {/* 6. MACRO SCIENCE */}
        <ScienceSection />

        {/* 5. MEAL PREVIEW GRID */}
        <MenuSection onNavigate={() => router.push("/client/menu")} />

        {/* 7. SIMPLE PRICING */}
        <PricingSection />

        {/* 8. TESTIMONIALS & COMMUNITY */}
        <TestimonialsSection />

        {/* 9. FAQ ACCORDION */}
        <FaqSection />

        {/* 10. FINAL CTA BANNER */}
        <CtaSection />

        {/* 11. FOOTER */}
        <PublicFooter />
      </SmoothScroll>
    </div>
  );
}
