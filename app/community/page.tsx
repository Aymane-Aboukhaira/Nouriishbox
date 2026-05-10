"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Instagram, Heart, MessageCircle, Users, Star,
  ChevronRight, ArrowRight, Share2, Award, Flame,
  Trophy, Camera
} from "lucide-react";

const COMMUNITY_POSTS = [
  {
    username: "@sarah_fit_casa",
    avatar: "SF",
    avatarColor: "#B09AE0",
    image: "/visuals/Menu/testemonials/PHOTO 01 — @fitness_sarah.jfif",
    caption: "Ma 12ème semaine avec Nourishbox et mes PR ne font qu'augmenter 🔥 Le Atlas Salmon Bowl est juste parfait après une séance de deadlift.",
    likes: 234,
    comments: 18,
    badge: "🏋️ Athlète",
  },
  {
    username: "@coach_achraf",
    avatar: "CA",
    avatarColor: "#2C3E2D",
    image: "/visuals/Menu/testemonials/PHOTO 02 — @coach_dave.jfif",
    caption: "Mes clients me demandent toujours comment je reste en forme tout en travaillant 12h/jour. Ma réponse : @nourishbox_ma 💪",
    likes: 456,
    comments: 32,
    badge: "🥇 Ambassadeur",
  },
  {
    username: "@kenza_eats",
    avatar: "KE",
    avatarColor: "#C4602A",
    image: "/visuals/Menu/testemonials/PHOTO 03 — @lena_eats.jfif",
    caption: "Le Tagine Vegan d'aujourd'hui m'a fait oublier que c'était un repas 'healthy'. Les épices sont incroyables, rien à voir avec les meal-preps fades.",
    likes: 189,
    comments: 24,
    badge: "🌱 Vegan",
  },
  {
    username: "@yassine_macros",
    avatar: "YM",
    avatarColor: "#F59E0B",
    image: "/visuals/Menu/testemonials/PHOTO 04 — @marcos_daily.jfif",
    caption: "4 mois de streak, -8kg de gras, +3kg de muscle sec. Les macros sont chirurgicales. Je ne reviendrai jamais en arrière.",
    likes: 512,
    comments: 45,
    badge: "🔥 Streak 120j",
  },
];

const STATS = [
  { value: "1 200+", label: "Membres actifs", icon: Users },
  { value: "98%", label: "Satisfaction", icon: Star },
  { value: "45j", label: "Streak moyen", icon: Flame },
  { value: "50K+", label: "Repas livrés", icon: Trophy },
];

const TESTIMONIALS = [
  {
    name: "Salma O.",
    role: "CrossFit Athlete",
    text: "Nourishbox a transformé ma préparation. Avant, je passais 4h le dimanche à peser mes repas. Maintenant, je me concentre sur ce qui compte : m'entraîner.",
    stars: 5,
    streak: "89 jours",
  },
  {
    name: "Mehdi T.",
    role: "Développeur Full-Stack",
    text: "En tant que dev, je passais mes pauses midi à commander n'importe quoi. Depuis Nourishbox, mon énergie l'après-midi a complètement changé.",
    stars: 5,
    streak: "45 jours",
  },
  {
    name: "Ines B.",
    role: "Maman de 2 enfants",
    text: "Le plan Famille est une bénédiction. Chaque enfant a son profil, ses portions adaptées. Plus de bataille à table pour manger 'sain'.",
    stars: 5,
    streak: "67 jours",
  },
];

const CHALLENGES = [
  {
    title: "Défi Macro Parfait",
    desc: "Atteignez 100% de vos macros cibles pendant 7 jours consécutifs",
    reward: "150 NourishPoints + Badge 💎",
    participants: 342,
    difficulty: "Intermédiaire",
    color: "#6BC4A0",
  },
  {
    title: "Streak de 30 Jours",
    desc: "Maintenez votre streak actif pendant 30 jours sans interruption",
    reward: "500 NourishPoints + -10% ce mois-ci",
    participants: 189,
    difficulty: "Avancé",
    color: "#C4602A",
  },
  {
    title: "Explorateur du Menu",
    desc: "Essayez 15 plats différents en 3 semaines",
    reward: "200 NourishPoints + Badge 🌍",
    participants: 567,
    difficulty: "Débutant",
    color: "#B09AE0",
  },
];

export default function CommunityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-[120px] pb-16">
        <div className="absolute inset-0 bg-[#2C3E2D] z-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
          {/* Floating blobs */}
          <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[20%] left-[10%] w-72 h-72 bg-[#C4602A] rounded-full blur-[100px]" />
          <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#6BC4A0] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.25em] font-sans">Communauté</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold text-[#F5F0E8] leading-[0.95] tracking-tight mb-8 mt-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
          >
            Plus qu&apos;un service.{" "}
            <span className="text-[#C4602A]">Un mouvement.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-[#F5F0E8]/70 font-sans max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Rejoignez 1 200+ Tangérois qui ont transformé leur alimentation. Partagez vos victoires, vos recettes,
            et soutenez-vous mutuellement dans votre parcours santé.
          </motion.p>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="mx-auto mb-2 text-[#C4602A]" size={24} />
                <div className="font-serif font-bold text-2xl md:text-3xl text-[#F5F0E8]">{stat.value}</div>
                <p className="text-xs text-[#F5F0E8]/50 font-sans font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COMMUNITY FEED (Instagram-style grid) ── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">Feed Communautaire</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight">Ce que nos membres partagent</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {COMMUNITY_POSTS.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-[24px] overflow-hidden border border-[#E8E3DB] shadow-[0_10px_40px_-10px_rgba(26,26,26,0.08)] group"
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-5 pb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-[#F5F0E8]" style={{ backgroundColor: post.avatarColor }}>
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-sans font-bold text-sm text-[#1A1A1A]">{post.username}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B6B] font-semibold">{post.badge}</span>
                  </div>
                  <Instagram size={18} className="text-[#9C9C9C]" />
                </div>

                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img src={post.image} alt={post.username} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>

                {/* Actions */}
                <div className="p-5">
                  <div className="flex items-center gap-5 mb-3">
                    <button className="flex items-center gap-1.5 text-[#1A1A1A] hover:text-[#C4602A] transition-colors">
                      <Heart size={20} /> <span className="text-sm font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-[#1A1A1A] hover:text-[#6BC4A0] transition-colors">
                      <MessageCircle size={20} /> <span className="text-sm font-bold">{post.comments}</span>
                    </button>
                    <div className="flex-1" />
                    <Share2 size={18} className="text-[#9C9C9C] cursor-pointer hover:text-[#C4602A] transition-colors" />
                  </div>
                  <p className="text-sm text-[#1A1A1A] font-sans leading-relaxed">
                    <strong>{post.username}</strong> {post.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 lg:py-32 px-6 bg-[#FAFAF7] border-y border-[#E8E3DB]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">Témoignages</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight">Des résultats, pas des promesses</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-[24px] border border-[#E8E3DB] shadow-sm flex flex-col"
              >
                <div className="flex text-[#F59E0B] gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" />)}
                </div>
                <p className="text-[#1A1A1A] font-sans italic text-lg leading-relaxed mb-6 flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif font-bold text-[#1A1A1A]">{t.name}</p>
                    <p className="text-xs text-[#9C9C9C] font-sans">{t.role}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#C4602A] bg-[#FFF0EA] px-3 py-1 rounded-full">
                    <Flame size={12} /> {t.streak}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHALLENGES ── */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans mb-4 block">Défis Actifs</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight">Relevez le défi, gagnez des récompenses</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHALLENGES.map((ch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-[24px] p-8 border border-[#E8E3DB] shadow-sm relative overflow-hidden"
              >
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: ch.color, opacity: 0.1 }} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: `${ch.color}20`, color: ch.color }}>
                      {ch.difficulty}
                    </span>
                    <span className="text-xs text-[#9C9C9C] font-sans">{ch.participants} participants</span>
                  </div>

                  <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">{ch.title}</h3>
                  <p className="text-sm text-[#6B6B6B] font-sans leading-relaxed mb-6">{ch.desc}</p>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAFAF7] border border-[#E8E3DB]">
                    <Award size={18} style={{ color: ch.color }} />
                    <span className="text-sm font-bold text-[#1A1A1A]">{ch.reward}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="py-24 lg:py-32 px-6 bg-[#2C3E2D]">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
            <h2 className="font-serif font-bold text-[#F5F0E8] leading-[0.95] tracking-tight mb-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
              Prêt à rejoindre <span className="text-[#C4602A]">1 200+ membres</span> ?
            </h2>
            <p className="text-lg text-[#F5F0E8]/60 font-sans max-w-xl mx-auto mb-10">
              Commencez avec une évaluation gratuite. Aucun engagement. Vous êtes libre de partir à tout moment.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/onboarding")}
              className="bg-[#C4602A] text-[#F5F0E8] px-10 py-5 rounded-full text-lg font-bold font-sans shadow-lg hover:bg-[#A04F22] transition-colors flex items-center gap-3 mx-auto"
            >
              Créer mon plan gratuit <ArrowRight size={20} />
            </motion.button>

            <p className="text-xs text-[#F5F0E8]/40 font-sans font-semibold tracking-wide mt-6 uppercase">
              2 minutes · Sans engagement · Annulez à tout moment
            </p>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
