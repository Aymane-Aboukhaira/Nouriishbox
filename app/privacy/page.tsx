"use client";

import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Lock } from "lucide-react";

const SECTIONS = [
  { title: "1. Introduction", content: "Chez Nourishbox SARL, la protection de vos données personnelles est une priorité absolue. Cette politique est conforme à la loi marocaine n° 09-08 et au RGPD." },
  { title: "2. Données Collectées", content: "Nous collectons : données d'identification (nom, email, téléphone), données biométriques nutritionnelles (âge, genre, poids, taille, activité, objectifs) utilisées exclusivement pour le calcul de vos macros via Mifflin-St Jeor, données alimentaires (préférences, allergènes, historique), données familiales pour les plans Couple/Famille, données de navigation (cookies, IP), et données de paiement gérées par nos prestataires certifiés PCI-DSS — nous ne stockons jamais vos numéros de carte." },
  { title: "3. Utilisation des Données", content: "Vos données servent à : calculer vos macros personnalisés, préparer et livrer vos commandes, personnaliser vos recommandations, alimenter votre tableau de bord de suivi, opérer la clinique virtuelle, gérer votre abonnement, administrer NourishPoints, améliorer notre service, et communiquer avec vous. Nous ne vendons jamais vos données à des tiers." },
  { title: "4. Base Légale", content: "Le traitement repose sur : l'exécution du contrat (livraison, macros), le consentement (marketing, cookies analytiques), l'intérêt légitime (amélioration du service), et l'obligation légale (fiscalité)." },
  { title: "5. Partage des Données", content: "Vos données sont partagées uniquement avec nos prestataires de livraison (nom, adresse), de paiement, et techniques (hébergement, analytics) — tous soumis à des accords de confidentialité stricts. Nous ne partageons pas vos données biométriques avec des tiers." },
  { title: "6. Sécurité", content: "Nous mettons en œuvre : chiffrement TLS/SSL et AES-256, authentification deux facteurs, contrôle d'accès basé sur les rôles, audits réguliers, sauvegardes quotidiennes redondantes, et politique de rétention avec suppression automatique. En cas de violation, notification sous 72h." },
  { title: "7. Conservation", content: "Données conservées pendant votre abonnement actif, 12 mois après résiliation pour réactivation facile, 5 ans pour la facturation (obligation légale). Au-delà, anonymisation ou suppression irréversible." },
  { title: "8. Cookies", content: "Cookies essentiels (authentification, session — non désactivables), analytiques (compréhension de l'usage — soumis au consentement), marketing (publicités personnalisées — soumis au consentement). Gérez vos préférences dans les paramètres de votre navigateur." },
  { title: "9. Vos Droits", content: "Conformément à la loi n° 09-08 : droit d'accès, de rectification, de suppression, d'opposition, de portabilité et de retrait du consentement. Contactez privacy@nourishbox.ma — réponse sous 30 jours." },
  { title: "10. Contact", content: "Nourishbox SARL — Responsable de la Protection des Données — Tanger, Maroc. Email : privacy@nourishbox.ma. Réclamations : CNDP du Maroc." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />
      <section className="relative pt-[140px] pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Lock className="mx-auto mb-6 text-[#2C3E2D]" size={40} />
          <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight mb-4">Politique de Confidentialité</h1>
          <p className="text-[#9C9C9C] font-sans text-sm">Dernière mise à jour : 1er mai 2026 · Nourishbox SARL — Tanger, Maroc</p>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12 p-6 rounded-[20px] bg-[#2C3E2D] text-[#F5F0E8]">
          <h3 className="font-serif text-lg mb-3">En résumé</h3>
          <ul className="text-sm font-sans space-y-2 text-[#F5F0E8]/80">
            <li>✓ Vos données ne sont jamais vendues à des tiers</li>
            <li>✓ Vos données biométriques servent uniquement au calcul de vos macros</li>
            <li>✓ Vous pouvez supprimer votre compte et vos données à tout moment</li>
            <li>✓ Chiffrement AES-256 et TLS pour toutes les données</li>
            <li>✓ Conforme à la loi marocaine n° 09-08 et au RGPD</li>
          </ul>
        </motion.div>

        <div className="space-y-10">
          {SECTIONS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.03 }}>
              <h2 className="font-serif text-xl text-[#1A1A1A] mb-4">{s.title}</h2>
              <p className="text-[#6B6B6B] font-sans leading-[1.8] text-[15px]">{s.content}</p>
              {i < SECTIONS.length - 1 && <hr className="mt-10 border-[#E8E3DB]" />}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 p-6 rounded-[20px] bg-[#F0EDF9] border border-[#B09AE0]/20 text-center">
          <p className="text-sm text-[#5B4B8A] font-sans">Pour exercer vos droits, contactez <a href="mailto:privacy@nourishbox.ma" className="font-bold underline">privacy@nourishbox.ma</a></p>
        </motion.div>
      </section>
      <PublicFooter />
    </div>
  );
}
