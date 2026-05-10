"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Search, ChevronDown, MessageCircle, Mail, Phone,
  Truck, CreditCard, Settings, User, CalendarDays,
  Shield, ArrowRight, HelpCircle, BookOpen
} from "lucide-react";

const CATEGORIES = [
  { icon: User, label: "Mon Compte", color: "#6BC4A0" },
  { icon: CalendarDays, label: "Abonnement", color: "#B09AE0" },
  { icon: Truck, label: "Livraison", color: "#C4602A" },
  { icon: CreditCard, label: "Facturation", color: "#F59E0B" },
  { icon: Settings, label: "Paramètres", color: "#6BC4A0" },
  { icon: Shield, label: "Sécurité", color: "#B09AE0" },
];

const FAQS = [
  { cat: "Mon Compte", q: "Comment créer mon compte Nourishbox ?", a: "Rendez-vous sur notre page d'onboarding. En 2 minutes, renseignez vos données (âge, poids, taille, objectifs) et notre algorithme calculera automatiquement vos macros personnalisés." },
  { cat: "Mon Compte", q: "Comment modifier mes données biométriques ?", a: "Depuis votre Dashboard, accédez à Paramètres > Profil. Modifiez vos données et vos macros seront recalculées instantanément via l'équation de Mifflin-St Jeor." },
  { cat: "Mon Compte", q: "Puis-je ajouter des membres à mon compte ?", a: "Oui ! Avec le plan Couple ou Famille, accédez au Family Hub pour ajouter jusqu'à 4 profils avec des macros individualisées." },
  { cat: "Abonnement", q: "Comment suspendre mon abonnement ?", a: "Depuis votre Dashboard > Paramètres, cliquez sur 'Suspendre'. Aucune facturation pendant la pause. Reprenez quand vous voulez." },
  { cat: "Abonnement", q: "Comment changer de plan (Solo → Couple → Famille) ?", a: "Depuis Paramètres > Abonnement, sélectionnez votre nouveau plan. Le changement prend effet dès le prochain cycle de facturation." },
  { cat: "Abonnement", q: "Y a-t-il un engagement minimum ?", a: "Non. Nourishbox est 100% sans engagement. Vous pouvez annuler à tout moment en 2 clics, sans pénalité ni frais cachés." },
  { cat: "Livraison", q: "Quand mes repas sont-ils livrés ?", a: "Les livraisons s'effectuent du lundi au vendredi, entre 7h00 et 12h00. Vous pouvez définir votre créneau préféré dans vos paramètres." },
  { cat: "Livraison", q: "Que se passe-t-il si je suis absent lors de la livraison ?", a: "Notre livreur déposera votre box dans un lieu sécurisé convenu (porte, gardien, etc.). Contactez-nous dans les 24h en cas de problème." },
  { cat: "Livraison", q: "Livrez-vous en dehors de Tanger ?", a: "Pour le moment, nous livrons uniquement à Tanger et ses environs. L'expansion vers d'autres villes marocaines est prévue pour 2027." },
  { cat: "Facturation", q: "Quand suis-je facturé ?", a: "Par défaut, chaque lundi pour la semaine en cours. Vous pouvez passer en facturation mensuelle (et économiser 15%) depuis vos paramètres." },
  { cat: "Facturation", q: "Quels moyens de paiement acceptez-vous ?", a: "Carte bancaire (Visa, Mastercard), paiement mobile, et virement bancaire. Tous les paiements sont sécurisés et chiffrés." },
  { cat: "Paramètres", q: "Comment spécifier mes allergies et régimes ?", a: "Lors de l'onboarding ou dans Paramètres > Préférences Alimentaires. Sélectionnez vos allergènes et régimes (halal, vegan, sans gluten). Le menu sera filtré automatiquement." },
  { cat: "Sécurité", q: "Mes données sont-elles en sécurité ?", a: "Absolument. Chiffrement AES-256 au repos, TLS en transit, et aucune donnée de carte bancaire stockée sur nos serveurs. Consultez notre Politique de Confidentialité pour les détails." },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = FAQS.filter((f) => {
    const matchesCat = !activeCat || f.cat === activeCat;
    const matchesSearch = search === "" || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-[140px] pb-16 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3E2D]/5 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <HelpCircle className="mx-auto mb-6 text-[#C4602A]" size={40} />
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4">Centre d&apos;Aide</h1>
          <p className="text-lg text-[#6B6B6B] font-sans max-w-xl mx-auto mb-10">Comment pouvons-nous vous aider aujourd&apos;hui ?</p>

          <div className="max-w-xl mx-auto relative">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full bg-white border border-[#E8E3DB] text-[#1A1A1A] placeholder:text-[#9C9C9C] outline-none focus:border-[#6BC4A0] transition-colors shadow-sm text-base font-sans"
            />
          </div>
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveCat(activeCat === cat.label ? null : cat.label)}
              className={`flex flex-col items-center gap-2 p-4 rounded-[20px] border transition-all ${activeCat === cat.label ? "bg-[#2C3E2D] text-[#F5F0E8] border-[#2C3E2D] shadow-md" : "bg-white text-[#6B6B6B] border-[#E8E3DB] hover:border-[#D4C9BE]"}`}
            >
              <cat.icon size={24} style={{ color: activeCat === cat.label ? "#F5F0E8" : cat.color }} />
              <span className="text-xs font-bold">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl text-[#1A1A1A]">{activeCat ? activeCat : "Toutes les questions"}</h2>
          <span className="text-sm text-[#9C9C9C] font-sans">{filtered.length} résultat{filtered.length !== 1 && "s"}</span>
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} className="bg-white rounded-[20px] border border-[#E8E3DB] overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex items-center justify-between p-6 text-left" aria-expanded={isOpen}>
                  <div className="flex items-center gap-3 flex-1 mr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#9C9C9C] shrink-0">{faq.cat}</span>
                    <span className="font-sans font-bold text-[#1A1A1A]">{faq.q}</span>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0">
                    <ChevronDown size={18} className="text-[#C4602A]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <p className="px-6 pb-6 text-[#6B6B6B] font-sans leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-[#D4C9BE] mb-4" />
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Aucun résultat</h3>
            <p className="text-sm text-[#6B6B6B] mb-4">Essayez un autre mot-clé ou contactez-nous directement.</p>
            <button onClick={() => { setSearch(""); setActiveCat(null); }} className="px-6 py-2 border-2 border-[#E8E3DB] text-[#1A1A1A] font-bold rounded-full">Réinitialiser</button>
          </div>
        )}
      </section>

      {/* CONTACT STRIP */}
      <section className="bg-[#2C3E2D] text-[#F5F0E8] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl text-[#F5F0E8] mb-4">Toujours besoin d&apos;aide ?</h2>
          <p className="text-[#F5F0E8]/60 font-sans mb-10">Notre équipe répond en moins de 2 heures pendant les jours ouvrables.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="mailto:support@nourishbox.ma" className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#C4602A] text-[#F5F0E8] font-bold text-sm hover:bg-[#A04F22] transition-colors">
              <Mail size={16} /> support@nourishbox.ma
            </a>
            <a href="tel:+212600000000" className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8] font-bold text-sm hover:bg-[#F5F0E8]/5 transition-colors">
              <Phone size={16} /> +212 6 00 00 00 00
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
