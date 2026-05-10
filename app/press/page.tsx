"use client";

import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Download, ExternalLink, Mail, ArrowRight, Camera, Quote } from "lucide-react";
import Image from "next/image";

const PRESS_RELEASES = [
  {
    date: "Mai 2026",
    title: "Nourishbox dépasse les 1 200 abonnés actifs à Tanger",
    excerpt: "En moins de 18 mois, la startup tangéroise de nutrition personnalisée a conquis plus de 1 200 foyers avec son approche unique combinant science des macros et cuisine marocaine.",
    tag: "Croissance",
    tagColor: "#6BC4A0",
  },
  {
    date: "Mars 2026",
    title: "Lancement du Plan Famille — jusqu'à 4 profils nutritionnels",
    excerpt: "Nourishbox étend son offre avec un plan familial permettant de personnaliser les macros de chaque membre du foyer, du sportif à l'enfant en pleine croissance.",
    tag: "Produit",
    tagColor: "#B09AE0",
  },
  {
    date: "Janvier 2026",
    title: "La Clinique Virtuelle de Nutrition intégrée à la plateforme",
    excerpt: "Les abonnés peuvent désormais consulter un nutritionniste IA 24/7, directement depuis leur tableau de bord, pour des conseils personnalisés en temps réel.",
    tag: "Innovation",
    tagColor: "#C4602A",
  },
  {
    date: "Octobre 2025",
    title: "50 000 repas livrés — le cap symbolique est franchi",
    excerpt: "Depuis son lancement, Nourishbox a préparé et livré plus de 50 000 repas calculés au gramme près, avec un taux de satisfaction de 98%.",
    tag: "Milestone",
    tagColor: "#F59E0B",
  },
  {
    date: "Juillet 2025",
    title: "Partenariat avec des coachs sportifs de Tanger",
    excerpt: "Nourishbox s'associe avec 15 coachs et salles de sport de Tanger pour offrir un accompagnement nutritionnel complémentaire à l'entraînement physique.",
    tag: "Partenariats",
    tagColor: "#6BC4A0",
  },
];

const MEDIA_QUOTES = [
  {
    source: "TelQuel",
    quote: "Nourishbox prouve que la healthtech marocaine peut allier rigueur scientifique et identité culinaire locale.",
  },
  {
    source: "L'Économiste",
    quote: "Un modèle d'abonnement sans engagement qui séduit la jeunesse connectée de Tanger.",
  },
  {
    source: "Hespress",
    quote: "La startup qui veut révolutionner la façon dont les Marocains mangent — un repas à la fois.",
  },
];

const BRAND_ASSETS = [
  { name: "Logo Principal", format: "PNG, SVG", size: "2.4 MB" },
  { name: "Logo Monochrome", format: "PNG, SVG", size: "1.8 MB" },
  { name: "Palette de Couleurs", format: "PDF", size: "540 KB" },
  { name: "Photos Produits (HR)", format: "ZIP", size: "45 MB" },
  { name: "Guide de Marque", format: "PDF", size: "12 MB" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-[140px] pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3E2D]/5 to-transparent pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Presse</span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4 leading-[0.95]">
            Nourishbox dans les{" "}
            <span className="text-[#C4602A]">médias</span>
          </h1>
          <p className="text-lg text-[#6B6B6B] font-sans max-w-2xl mx-auto leading-relaxed mb-8">
            Retrouvez nos dernières actualités, communiqués de presse et ressources médias.
            Pour toute demande presse, contactez-nous directement.
          </p>

          <motion.a
            href="mailto:presse@nourishbox.ma"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2C3E2D] text-[#F5F0E8] px-8 py-4 rounded-full text-sm font-bold font-sans shadow-lg hover:bg-[#1A1A1A] transition-colors inline-flex items-center gap-3"
          >
            <Mail size={16} /> Contact Presse : presse@nourishbox.ma
          </motion.a>
        </motion.div>
      </section>

      {/* ── KEY FACTS ── */}
      <section className="py-16 px-6 bg-[#2C3E2D] text-[#F5F0E8]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2024", label: "Fondée" },
            { value: "1 200+", label: "Abonnés actifs" },
            { value: "50K+", label: "Repas livrés" },
            { value: "98%", label: "Satisfaction" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="font-serif font-bold text-3xl md:text-4xl text-[#F5F0E8] mb-1">{stat.value}</div>
              <p className="text-xs text-[#F5F0E8]/50 font-sans font-semibold uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MEDIA QUOTES ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Ce qu&apos;ils disent</span>
            <h2 className="font-serif text-4xl text-[#1A1A1A] tracking-tight">Dans la presse</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MEDIA_QUOTES.map((mq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="bg-white p-8 rounded-[24px] border border-[#E8E3DB] shadow-sm"
              >
                <Quote size={28} className="text-[#C4602A]/20 mb-4" />
                <p className="text-[#1A1A1A] font-sans italic text-lg leading-relaxed mb-6">&ldquo;{mq.quote}&rdquo;</p>
                <p className="font-serif font-bold text-[#C4602A]">— {mq.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESS RELEASES ── */}
      <section className="py-24 px-6 bg-[#FAFAF7] border-y border-[#E8E3DB]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Communiqués</span>
            <h2 className="font-serif text-4xl text-[#1A1A1A] tracking-tight">Actualités récentes</h2>
          </motion.div>

          <div className="space-y-6">
            {PRESS_RELEASES.map((pr, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-white rounded-[24px] p-8 border border-[#E8E3DB] shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-[#9C9C9C] font-sans font-semibold">{pr.date}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: `${pr.tagColor}15`, color: pr.tagColor }}>{pr.tag}</span>
                    </div>
                    <h3 className="font-serif text-xl text-[#1A1A1A] mb-2 group-hover:text-[#C4602A] transition-colors">{pr.title}</h3>
                    <p className="text-sm text-[#6B6B6B] font-sans leading-relaxed">{pr.excerpt}</p>
                  </div>
                  <ExternalLink size={20} className="text-[#9C9C9C] group-hover:text-[#C4602A] transition-colors shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND ASSETS ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Kit Média</span>
            <h2 className="font-serif text-4xl text-[#1A1A1A] tracking-tight mb-4">Ressources de marque</h2>
            <p className="text-[#6B6B6B] font-sans max-w-xl mx-auto">
              Téléchargez nos logos, couleurs et photos produits haute résolution pour vos articles et publications.
            </p>
          </motion.div>

          {/* Logo preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[24px] p-12 border border-[#E8E3DB] shadow-sm mb-10 flex items-center justify-center gap-10 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Nourishbox" width={56} height={56} className="rounded-xl" />
              <span className="font-serif text-3xl">
                <span className="text-[#6BC4A0]">nourish</span><span className="text-[#C4602A]">box</span>
              </span>
            </div>
            <div className="flex gap-4">
              {["#2C3E2D", "#C4602A", "#6BC4A0", "#F5F0E8", "#1A1A1A"].map((c) => (
                <div key={c} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: c }} />
                  <span className="text-[9px] font-mono text-[#9C9C9C]">{c}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-3">
            {BRAND_ASSETS.map((asset, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-white rounded-xl p-5 border border-[#E8E3DB] flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <Camera size={20} className="text-[#C4602A]" />
                  <div>
                    <p className="font-sans font-bold text-sm text-[#1A1A1A] group-hover:text-[#C4602A] transition-colors">{asset.name}</p>
                    <p className="text-xs text-[#9C9C9C] font-sans">{asset.format} · {asset.size}</p>
                  </div>
                </div>
                <Download size={18} className="text-[#9C9C9C] group-hover:text-[#C4602A] transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
