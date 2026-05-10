"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Calculator, BarChart3, CalendarDays, Users, Brain,
  Truck, PauseCircle, Shield, Sparkles, Leaf, ArrowRight,
  Zap, TrendingUp, ChefHat, Heart
} from "lucide-react";

const FEATURES = [
  {
    category: "Nutrition de Précision",
    icon: Calculator,
    title: "Macros calculées scientifiquement",
    desc: "L'équation de Mifflin-St Jeor, personnalisée pour votre âge, poids, taille, niveau d'activité et objectif. Chaque repas est portionné au gramme près.",
    color: "#6BC4A0",
    bg: "#E8F7F1",
  },
  {
    category: "Intelligence",
    icon: Brain,
    title: "Algorithme de recommandation",
    desc: "Notre moteur analyse vos macros restantes en temps réel et vous suggère les plats les plus adaptés pour combler l'écart — automatiquement.",
    color: "#B09AE0",
    bg: "#F0EDF9",
  },
  {
    category: "Planification",
    icon: CalendarDays,
    title: "Planificateur hebdomadaire drag & drop",
    desc: "Organisez vos 7 jours de la semaine avec un Kanban intuitif. Glissez, déposez, échangez. Votre semaine, votre contrôle.",
    color: "#C4602A",
    bg: "#FFF0EA",
  },
  {
    category: "Famille",
    icon: Users,
    title: "Jusqu'à 4 profils nutritionnels",
    desc: "Chaque membre de votre famille a ses propres objectifs, macros et portions. Du sportif de 80kg à l'enfant de 8 ans.",
    color: "#F59E0B",
    bg: "#FFF9DB",
  },
  {
    category: "Suivi",
    icon: BarChart3,
    title: "Analytics et heatmap d'adhérence",
    desc: "Graphiques de tendances sur 30 jours, heatmap style GitHub, et tracking de streak. Visualisez vos progrès comme jamais.",
    color: "#6BC4A0",
    bg: "#E8F7F1",
  },
  {
    category: "Clinique",
    icon: Heart,
    title: "Nutritionniste IA virtuelle",
    desc: "Posez vos questions 24/7. Notre clinique virtuelle analyse vos habitudes et répond en temps réel avec des conseils personnalisés.",
    color: "#B09AE0",
    bg: "#F0EDF9",
  },
  {
    category: "Livraison",
    icon: Truck,
    title: "Livraison gratuite — toujours",
    desc: "Pas de montant minimum. Pas de frais cachés. Vos repas arrivent frais à votre porte chaque semaine, partout à Tanger.",
    color: "#C4602A",
    bg: "#FFF0EA",
  },
  {
    category: "Flexibilité",
    icon: PauseCircle,
    title: "Pause, report, annulation",
    desc: "Vacances ? Voyage d'affaires ? Suspendez en un clic. Reprenez quand vous voulez. Zéro engagement, zéro pénalité.",
    color: "#F59E0B",
    bg: "#FFF9DB",
  },
  {
    category: "Gamification",
    icon: Zap,
    title: "NourishPoints et streaks",
    desc: "Gagnez des points à chaque plan confirmé, chaque jour de streak, chaque défi relevé. Échangez-les contre des réductions réelles.",
    color: "#6BC4A0",
    bg: "#E8F7F1",
  },
  {
    category: "Qualité",
    icon: ChefHat,
    title: "Chefs professionnels",
    desc: "Nos plats ne sont pas des 'meal-preps'. Ce sont des créations de chefs, inspirées de la cuisine marocaine et méditerranéenne.",
    color: "#C4602A",
    bg: "#FFF0EA",
  },
  {
    category: "Sécurité",
    icon: Shield,
    title: "Allergènes et préférences",
    desc: "Spécifiez vos allergies, régimes et dégoûts alimentaires. Notre système filtre automatiquement tout ce qui n'est pas pour vous.",
    color: "#B09AE0",
    bg: "#F0EDF9",
  },
  {
    category: "Croissance",
    icon: TrendingUp,
    title: "Mifflin-St Jeor adaptatif",
    desc: "Vos objectifs changent ? Votre poids bouge ? Mettez à jour votre profil et vos macros sont recalculées instantanément.",
    color: "#F59E0B",
    bg: "#FFF9DB",
  },
];

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-[140px] pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3E2D]/5 to-transparent pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Fonctionnalités</span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4 leading-[0.95]">
            Tout ce dont vous avez besoin.{" "}
            <span className="text-[#C4602A]">Rien de superflu.</span>
          </h1>
          <p className="text-lg text-[#6B6B6B] font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
            Nourishbox combine science nutritionnelle, technologie intelligente et cuisine de chef dans une plateforme conçue pour simplifier votre vie.
          </p>
        </motion.div>

        {/* Quick feature icons row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          {[
            { icon: Calculator, text: "Macros Exactes" },
            { icon: Brain, text: "IA Intégrée" },
            { icon: Truck, text: "Livraison Gratuite" },
            { icon: Shield, text: "Allergènes Filtrés" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C3E2D] text-[#F5F0E8] text-xs font-bold uppercase tracking-wider">
              <f.icon size={14} /> {f.text}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: "0 20px 60px -10px rgba(44,62,45,0.12)" }}
              className="bg-white rounded-[24px] p-8 border border-[#E8E3DB] shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: feat.bg }}>
                  <feat.icon size={24} style={{ color: feat.color }} />
                </div>
                <span className="text-[10px] font-bold text-[#9C9C9C] uppercase tracking-widest">{feat.category}</span>
              </div>
              <h3 className="font-serif text-xl text-[#1A1A1A] mb-3 leading-tight">{feat.title}</h3>
              <p className="text-sm text-[#6B6B6B] font-sans leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS STRIP ── */}
      <section className="bg-[#2C3E2D] text-[#F5F0E8] py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">En Pratique</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] tracking-tight mb-16 leading-[0.95]">
              Comment ça fonctionne
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Créez votre profil", desc: "2 minutes. Entrez vos données, vos objectifs et vos préférences alimentaires." },
              { step: "02", title: "Recevez votre plan", desc: "Notre algorithme calcule vos macros et génère un menu personnalisé chaque semaine." },
              { step: "03", title: "Régalez-vous", desc: "Vos repas frais arrivent à votre porte. Suivez vos progrès en temps réel." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <span className="font-serif text-6xl font-bold text-[#C4602A] block mb-4">{s.step}</span>
                <h3 className="font-serif text-xl text-[#F5F0E8] mb-3">{s.title}</h3>
                <p className="text-sm text-[#F5F0E8]/60 font-sans leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#FFF8F4] rounded-[3rem] py-16 px-8 text-center border border-[#E8E3DB] shadow-[0_20px_60px_-15px_rgba(44,62,45,0.1)] relative overflow-hidden"
        >
          <Sparkles className="mx-auto mb-6 text-[#C4602A]" size={40} />
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4 tracking-tight">Essayez gratuitement</h2>
          <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto mb-10 font-sans">
            Votre première évaluation nutritionnelle est offerte. Découvrez vos macros idéales en 2 minutes.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/onboarding")}
            className="bg-[#2C3E2D] text-[#F5F0E8] px-10 py-5 rounded-full text-lg font-bold font-sans shadow-lg hover:bg-[#1A1A1A] transition-colors flex items-center gap-3 mx-auto"
          >
            Commencer maintenant <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
