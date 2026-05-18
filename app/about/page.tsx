"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Heart, Leaf, Users, MapPin, ChefHat, Target,
  ArrowRight, Sprout, Globe2, Sparkles, Award, Utensils, Building2
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
    desc: "Le cumin, le safran, la harissa — nous prouvons que manger sainement ne veut pas dire manger fade. Nos chefs partenaires sont des artistes.",
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
  {
    year: "2024",
    event: "L'observation qui a tout déclenché",
    desc: "En travaillant chez McDonald's à Tanger, Aymane remarque chaque jour les mêmes visages : des sportifs en tenue de gym, des professionnels en costume, tous dans la même file — pressés, sans autre option rapide. Son manager confirme : la majorité vient non pas par envie, mais par manque de temps et d'alternative.",
  },
  {
    year: "2024",
    event: "Le constat personnel",
    desc: "Aymane essaie lui-même de manger sainement. Pas de système clair. Les applications sont en anglais, les macros sont floues, les plats locaux ne sont pas répertoriés. Il réalise qu'il manque un service pensé pour Tanger — en arabe, en darija, avec des vrais plats marocains.",
  },
  {
    year: "2025",
    event: "Les premiers repas sortent de la dark kitchen",
    desc: "En partenariat avec une dark kitchen locale, les premières box Nourishbox sont préparées. Tout est pesé au gramme. Les profils sont configurés à la main. Les retours des premiers testeurs sont clairs : le goût est là, les macros aussi.",
  },
  {
    year: "2025 →",
    event: "Lancement officiel — les premières inscriptions ouvertes",
    desc: "La plateforme ouvre au public. Chaque abonné reçoit un plan hebdomadaire personnalisé basé sur ses objectifs réels. Nous n'avons pas encore 1 000 clients — mais chaque repas livré est une promesse tenue.",
  },
];

// Honest team: founder + dark kitchen partners only
const TEAM = [
  {
    name: "Aymane A.",
    role: "Fondateur & Produit",
    initials: "AA",
    color: "#2C3E2D",
    desc: "Vision, plateforme, et chaque détail de l'expérience client.",
  },
  {
    name: "Dark Kitchen",
    role: "Partenaire Cuisine",
    initials: "🍳",
    color: "#C4602A",
    desc: "Notre cuisine partenaire à Tanger — préparation, pesée, et qualité à chaque box.",
    isEmoji: true,
  },
  {
    name: "Livraison",
    role: "Partenaire Logistique",
    initials: "🛵",
    color: "#6BC4A0",
    desc: "Livraison rapide, fraîcheur garantie jusqu'à votre porte.",
    isEmoji: true,
  },
];

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
            Né d&apos;une observation.{" "}
            <span className="text-[#C4602A]">Construit pour vous.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-[#F5F0E8]/70 font-sans max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Nourishbox est né d&apos;un constat simple fait derrière un comptoir — les gens qui veulent bien
            manger n&apos;ont pas de système qui leur correspond. On a décidé de le construire.
          </motion.p>

          {/* Honest pre-launch stats — no fake numbers */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { value: "30+", label: "Plats au menu" },
              { value: "100%", label: "Ingrédients locaux" },
              { value: "Tanger", label: "Notre ville" },
              { value: "2025", label: "Lancement" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-serif font-bold text-3xl md:text-4xl text-[#F5F0E8]">{stat.value}</div>
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
              Ce que j&apos;ai vu derrière un comptoir a tout changé
            </h2>
            <div className="space-y-5 text-[#6B6B6B] font-sans leading-relaxed text-lg">
              <p>
                Je travaillais chez McDonald&apos;s à Tanger. Tous les jours, je voyais défiler les mêmes profils :
                des gars qui sortaient de la salle de sport en tenue de training, des professionnels en costume,
                des gens qui n&apos;avaient pas le temps. Ils ne choisissaient pas la restauration rapide — ils
                y étaient <em>contraints</em>.
              </p>
              <p>
                Mon manager me l&apos;a confirmé un jour : &ldquo;La plupart viennent ici non pas parce qu&apos;ils
                aiment ça, mais parce qu&apos;on est rapides et qu&apos;ils n&apos;ont pas d&apos;autre option.&rdquo;
              </p>
              <p>
                J&apos;ai essayé moi-même de manger sainement. Pas d&apos;application en darija, pas de macros
                pour des plats marocains, pas de système livré à domicile. J&apos;ai réalisé qu&apos;il n&apos;existait
                rien de structuré pour des gens comme nous — des Tangérois qui veulent bien manger
                sans y passer leur soirée.
              </p>
              <p>
                <strong className="text-[#2C3E2D]">Nourishbox</strong> est ma réponse à ce vide.
              </p>
            </div>
          </motion.div>

          {/* Photo */}
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
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">L&apos;équipe</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] tracking-tight">Petite équipe. Grande exigence.</h2>
            <p className="text-[#F5F0E8]/60 font-sans mt-4 max-w-xl mx-auto text-lg">
              Nourishbox est porté par son fondateur et une chaîne de partenaires soigneusement sélectionnés.
              Pas de figure de style — juste les bonnes personnes au bon endroit.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center text-center group bg-white/5 rounded-[24px] p-8 border border-[#F5F0E8]/10 hover:bg-white/10 transition-all"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-serif font-bold mb-5 shadow-lg group-hover:scale-105 transition-transform border-2 border-[#F5F0E8]/10"
                  style={{ backgroundColor: member.isEmoji ? "rgba(255,255,255,0.08)" : member.color, color: "#F5F0E8" }}
                >
                  {member.initials}
                </div>
                <h4 className="font-serif text-xl text-[#F5F0E8] mb-1">{member.name}</h4>
                <p className="text-sm text-[#C4602A] font-bold uppercase tracking-widest mb-3">{member.role}</p>
                <p className="text-sm text-[#F5F0E8]/50 font-sans leading-relaxed">{member.desc}</p>
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
              Faites partie des premiers
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto mb-10 font-sans relative z-10">
              Nous sommes en phase de lancement. Chaque abonnement compte — et chaque retour nous aide à construire
              le service que Tanger mérite. Votre premier plan est gratuit et prend 2 minutes.
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
