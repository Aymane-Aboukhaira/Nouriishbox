"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Heart, Leaf, Users, MapPin, ChefHat, Target,
  ArrowRight, Sprout, Globe2, Sparkles, Award
} from "lucide-react";

const VALUES = [
  {
    icon: Leaf,
    title: "Fraîcheur absolue",
    desc: "Nos ingrédients arrivent du marché central de Tanger chaque matin. Zéro conservateur, zéro surgelé — uniquement du vivant.",
    color: "#6BC4A0",
    bg: "#E8F7F1",
  },
  {
    icon: Target,
    title: "Précision macro",
    desc: "Chaque gramme est pesé, chaque calorie est comptée. L'équation de Mifflin-St Jeor n'est pas un gadget — c'est notre fondation.",
    color: "#B09AE0",
    bg: "#F0EDF9",
  },
  {
    icon: Heart,
    title: "Saveurs du Maroc",
    desc: "Le cumin, le safran, la harissa — nous prouvons que manger sainement ne veut pas dire manger fade. Nos chefs sont des artistes.",
    color: "#C4602A",
    bg: "#FFF0EA",
  },
  {
    icon: Users,
    title: "Pour toute la famille",
    desc: "Du sportif au tout-petit, chaque profil a ses besoins. Nourishbox s'adapte à chacun sous votre toit.",
    color: "#F59E0B",
    bg: "#FFF9DB",
  },
];

const MILESTONES = [
  { year: "2024", event: "L'idée naît dans un café de la Médina", desc: "Deux amis, frustrés par l'impossibilité de manger sainement à Tanger sans passer 3h en cuisine, griffonnent les premières maquettes sur une serviette." },
  { year: "2025", event: "Premier prototype cuisiné dans une cuisine familiale", desc: "50 box-test livrées à des amis. Les retours sont unanimes : le goût est là, les macros aussi." },
  { year: "2025", event: "Lancement officiel — 200 premiers abonnés", desc: "Ouverture de notre dark kitchen à Tanger avec 3 chefs et un algorithme de planification hebdomadaire." },
  { year: "2026", event: "1 200+ membres actifs chaque semaine", desc: "Extension de notre carte, lancement du plan Famille, et clinique virtuelle de nutrition intégrée à la plateforme." },
];

const TEAM = [
  { name: "Aymane A.", role: "Co-fondateur & Produit", initials: "AA", color: "#2C3E2D" },
  { name: "Youssef K.", role: "Co-fondateur & Opérations", initials: "YK", color: "#C4602A" },
  { name: "Chef Amine", role: "Chef Exécutif", initials: "CA", color: "#6BC4A0" },
  { name: "Dr. Leila M.", role: "Nutritionniste en chef", initials: "LM", color: "#B09AE0" },
  { name: "Imane R.", role: "Design & Expérience", initials: "IR", color: "#F59E0B" },
  { name: "Karim B.", role: "Logistique & Livraison", initials: "KB", color: "#FFA07A" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("fr-FR")}{suffix}
    </span>
  );
}

export default function AboutPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-[120px]">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 bg-[#2C3E2D] z-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-block mb-6">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.25em] font-sans">Notre Histoire</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold text-[#F5F0E8] leading-[0.95] tracking-tight mb-8"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
          >
            Né à Tanger.{" "}
            <span className="text-[#C4602A]">Pensé pour vous.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-[#F5F0E8]/70 font-sans max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Nourishbox est né d&apos;une frustration simple : pourquoi est-il si difficile de manger sainement
            quand on vit à 100 à l&apos;heure ? Nous avons décidé de changer la donne — un repas à la fois.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { value: 1200, suffix: "+", label: "Membres actifs" },
              { value: 30, suffix: "+", label: "Plats au menu" },
              { value: 50000, suffix: "+", label: "Repas livrés" },
              { value: 98, suffix: "%", label: "Taux de satisfaction" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-serif font-bold text-3xl md:text-4xl text-[#F5F0E8]">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-[#F5F0E8]/50 font-sans font-semibold uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-[#F5F0E8]/30 rounded-full flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-[#C4602A]" animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">Comment tout a commencé</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight mb-6 leading-[1.1]">
              Un café, une serviette, et une obsession
            </h2>
            <div className="space-y-5 text-[#6B6B6B] font-sans leading-relaxed text-lg">
              <p>
                En 2024, deux amis se retrouvent dans un café de la médina de Tanger. La conversation tourne
                autour d&apos;un constat partagé : entre les journées de travail intenses et l&apos;offre alimentaire
                locale, impossible de manger &ldquo;propre&rdquo; sans sacrifier des heures en cuisine.
              </p>
              <p>
                Sur une serviette, ils dessinent le plan d&apos;un service qui livrerait des repas frais, calculés au
                gramme près pour chaque individu. Pas un meal-prep fade sous vide. De vrais plats marocains —
                avec du cumin, du safran, de la harissa — mais dosés scientifiquement.
              </p>
              <p>
                Six mois plus tard, les 50 premières box sortent d&apos;une cuisine familiale. Les retours sont
                unanimes. <strong className="text-[#2C3E2D]">Nourishbox</strong> est né.
              </p>
            </div>
          </motion.div>

          {/* Photo placeholder — stacked boxes visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(44,62,45,0.25)]"
          >
            <Image src="/stackedboxes.png" alt="Nourishbox packaging" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E2D]/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="font-serif text-2xl text-[#F5F0E8] mb-1">Fait à Tanger</p>
              <p className="text-sm text-[#F5F0E8]/70 font-sans flex items-center gap-2">
                <MapPin size={14} /> Maroc
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 lg:py-32 px-6 bg-[#FAFAF7] border-y border-[#E8E3DB]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">Notre parcours</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight">De l&apos;idée à votre assiette</h2>
          </motion.div>

          <div className="relative">
            {/* Central line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[#E8E3DB] md:-translate-x-px" />

            {MILESTONES.map((ms, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`relative flex flex-col md:flex-row items-start gap-6 mb-16 last:mb-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#C4602A] border-4 border-[#FAFAF7] z-10 shadow-sm" />

                {/* Content card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-40px)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <span className="font-serif text-3xl font-bold text-[#C4602A]">{ms.year}</span>
                  <h3 className="font-serif text-xl text-[#1A1A1A] mt-2 mb-2">{ms.event}</h3>
                  <p className="text-[#6B6B6B] font-sans text-sm leading-relaxed">{ms.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">Nos Valeurs</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight">Ce qui nous guide chaque jour</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, boxShadow: "0 20px 60px -10px rgba(44,62,45,0.12)" }}
                className="p-8 rounded-[24px] border border-[#E8E3DB] bg-white transition-all"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: val.bg }}>
                  <val.icon size={28} style={{ color: val.color }} />
                </div>
                <h3 className="font-serif text-xl text-[#1A1A1A] mb-3">{val.title}</h3>
                <p className="text-[#6B6B6B] font-sans leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 lg:py-32 px-6 bg-[#2C3E2D] text-[#F5F0E8]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">L&apos;Équipe</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] tracking-tight">Les visages derrière vos repas</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-2xl md:text-3xl font-serif font-bold mb-4 shadow-lg group-hover:scale-105 transition-transform border-2 border-[#F5F0E8]/10"
                  style={{ backgroundColor: member.color, color: "#F5F0E8" }}
                >
                  {member.initials}
                </div>
                <h4 className="font-serif text-lg text-[#F5F0E8]">{member.name}</h4>
                <p className="text-sm text-[#F5F0E8]/60 font-sans">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION CTA ── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#FFF8F4] rounded-[3rem] py-16 px-8 border border-[#E8E3DB] shadow-[0_20px_60px_-15px_rgba(44,62,45,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-10 w-64 h-64 bg-[#6BC4A0]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#C4602A]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <Sparkles className="mx-auto mb-6 text-[#C4602A]" size={40} />
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4 tracking-tight relative z-10">
              Rejoignez l&apos;aventure
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto mb-10 font-sans relative z-10">
              Que vous soyez sportif, maman active ou simplement curieux — votre premier plan est gratuit et prend 2 minutes.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/onboarding")}
              className="bg-[#2C3E2D] text-[#F5F0E8] px-10 py-5 rounded-full text-lg font-bold font-sans shadow-lg hover:bg-[#1A1A1A] transition-colors flex items-center gap-3 mx-auto relative z-10"
            >
              Obtenir mon plan gratuit <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
