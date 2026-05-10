"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  MapPin, Heart, Sparkles, ArrowRight, Code2,
  ChefHat, Megaphone, TrendingUp, Users, Leaf, Clock,
  GraduationCap, Coffee
} from "lucide-react";

const POSITIONS = [
  {
    title: "Chef Cuisinier Senior",
    department: "Cuisine",
    location: "Tanger, Maroc",
    type: "CDI — Temps plein",
    icon: ChefHat,
    color: "#C4602A",
    bg: "#FFF0EA",
    desc: "Vous créez des plats qui combinent gastronomie marocaine et nutrition de précision. Vous travaillez avec notre équipe data pour respecter les macros au gramme près.",
    requirements: [
      "5+ ans d'expérience en cuisine professionnelle",
      "Maîtrise de la cuisine marocaine et méditerranéenne",
      "Capacité à travailler avec des contraintes nutritionnelles strictes",
      "Passion pour l'innovation culinaire saine",
    ],
  },
  {
    title: "Développeur Full-Stack",
    department: "Produit",
    location: "Tanger, Maroc (hybride)",
    type: "CDI — Temps plein",
    icon: Code2,
    color: "#6BC4A0",
    bg: "#E8F7F1",
    desc: "Vous construisez la plateforme qui nourrit +1 200 familles. Stack : Next.js, TypeScript, Zustand, Framer Motion, Supabase.",
    requirements: [
      "3+ ans en développement React/Next.js",
      "Maîtrise de TypeScript et des API REST/GraphQL",
      "Sensibilité UX et goût pour le craft frontend",
      "Bonus : expérience avec Zustand, Framer Motion",
    ],
  },
  {
    title: "Responsable Marketing Digital",
    department: "Croissance",
    location: "Tanger, Maroc",
    type: "CDI — Temps plein",
    icon: Megaphone,
    color: "#B09AE0",
    bg: "#F0EDF9",
    desc: "Vous définissez et exécutez la stratégie d'acquisition. Social media, content marketing, paid ads, et partenariats influenceurs — tout passe par vous.",
    requirements: [
      "3+ ans en marketing digital (B2C préféré)",
      "Maîtrise de Meta Ads, Google Ads et analytics",
      "Expérience en content creation et community management",
      "Français et arabe courants, anglais opérationnel",
    ],
  },
  {
    title: "Nutritionniste Clinique",
    department: "Science",
    location: "Tanger, Maroc",
    type: "Temps partiel / Freelance",
    icon: GraduationCap,
    color: "#F59E0B",
    bg: "#FFF9DB",
    desc: "Vous validez nos algorithmes nutritionnels, supervisez les plans macro et participez à la clinique virtuelle. Votre avis est la base de notre crédibilité scientifique.",
    requirements: [
      "Diplôme en nutrition, diététique ou médecine",
      "Connaissance approfondie de la macro-nutrition sportive",
      "Capacité à vulgariser pour un public non-expert",
      "Bonus : expérience en téléconsultation",
    ],
  },
];

const PERKS = [
  { icon: Coffee, title: "Repas Nourishbox offerts", desc: "Tous vos repas sont pris en charge — évidemment." },
  { icon: Clock, title: "Horaires flexibles", desc: "On mesure les résultats, pas les heures de présence." },
  { icon: Heart, title: "Assurance santé", desc: "Couverture médicale complète pour vous et votre famille." },
  { icon: TrendingUp, title: "Equity & croissance", desc: "Participez à l'aventure avec des stock options." },
  { icon: Users, title: "Équipe soudée", desc: "On est 12. Vous connaîtrez tout le monde dès le premier jour." },
  { icon: Leaf, title: "Impact réel", desc: "Chaque jour, vous aidez des gens à mieux manger. Vraiment." },
];

export default function CareersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-[140px] pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3E2D]/5 to-transparent pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Carrières</span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4 leading-[0.95]">
            Construisez l&apos;avenir de la{" "}
            <span className="text-[#C4602A]">nutrition.</span>
          </h1>
          <p className="text-lg text-[#6B6B6B] font-sans max-w-2xl mx-auto leading-relaxed">
            Nous sommes une petite équipe avec une grande mission : rendre l&apos;alimentation saine accessible,
            délicieuse et personnalisée pour tout le monde à Tanger — et bientôt, au Maroc entier.
          </p>
        </motion.div>
      </section>

      {/* ── CULTURE ── */}
      <section className="py-20 px-6 bg-[#2C3E2D] text-[#F5F0E8]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Notre Culture</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] tracking-tight mb-8">
              Pas de bureaucratie. Juste du craft.
            </h2>
            <p className="text-lg text-[#F5F0E8]/60 font-sans max-w-2xl mx-auto leading-relaxed mb-16">
              Chez Nourishbox, chacun est propriétaire de son domaine. On ship vite, on itère ensemble,
              et on mange bien — littéralement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-6 rounded-[20px] border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 text-left"
              >
                <perk.icon size={24} className="text-[#C4602A] mb-4" />
                <h3 className="font-serif text-lg text-[#F5F0E8] mb-2">{perk.title}</h3>
                <p className="text-sm text-[#F5F0E8]/60 font-sans">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN POSITIONS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Postes Ouverts</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight">
              {POSITIONS.length} postes à pourvoir
            </h2>
          </motion.div>

          <div className="space-y-6">
            {POSITIONS.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white rounded-[24px] p-8 border border-[#E8E3DB] shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: pos.bg }}>
                    <pos.icon size={28} style={{ color: pos.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl text-[#1A1A1A]">{pos.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: pos.bg, color: pos.color }}>{pos.department}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#9C9C9C] font-sans mb-4">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {pos.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {pos.type}</span>
                    </div>
                    <p className="text-[#6B6B6B] font-sans leading-relaxed mb-5">{pos.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {pos.requirements.map((req, j) => (
                        <span key={j} className="text-xs px-3 py-1.5 rounded-full bg-[#FAFAF7] border border-[#E8E3DB] text-[#6B6B6B] font-sans">{req}</span>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full text-sm font-bold text-[#F5F0E8] shrink-0 self-start md:self-center flex items-center gap-2 transition-colors"
                    style={{ backgroundColor: pos.color }}
                  >
                    Postuler <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONTANEOUS APPLICATION ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#FFF8F4] rounded-[3rem] py-16 px-8 text-center border border-[#E8E3DB] shadow-[0_20px_60px_-15px_rgba(44,62,45,0.1)] relative overflow-hidden"
        >
          <Sparkles className="mx-auto mb-6 text-[#C4602A]" size={40} />
          <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-4">Votre poste n&apos;est pas listé ?</h2>
          <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto mb-10 font-sans">
            Envoyez-nous une candidature spontanée. Si vous partagez notre passion pour la nutrition
            et la technologie, nous trouverons une place pour vous.
          </p>
          <motion.a
            href="mailto:careers@nourishbox.ma"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2C3E2D] text-[#F5F0E8] px-10 py-5 rounded-full text-lg font-bold font-sans shadow-lg hover:bg-[#1A1A1A] transition-colors inline-flex items-center gap-3"
          >
            careers@nourishbox.ma <ArrowRight size={20} />
          </motion.a>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
