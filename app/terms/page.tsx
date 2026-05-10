"use client";

import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Scale } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Acceptation des Conditions",
    content: `En accédant à la plateforme Nourishbox (le "Service"), opérée par Nourishbox SARL, société de droit marocain basée à Tanger (RC: XXXX), vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service.

L'utilisation du Service implique l'acceptation pleine et entière de l'ensemble des conditions décrites ci-après. Nourishbox se réserve le droit de modifier ces conditions à tout moment, les modifications prenant effet dès leur publication sur la plateforme.`,
  },
  {
    title: "2. Description du Service",
    content: `Nourishbox est un service de livraison de repas personnalisés basé à Tanger, Maroc. Le Service comprend :

• La création d'un profil nutritionnel personnalisé basé sur vos données biométriques
• Le calcul automatique de vos macros nutritionnels via l'équation de Mifflin-St Jeor
• La composition et la livraison hebdomadaire de repas frais et portionnés
• L'accès à un tableau de bord de suivi nutritionnel et à une clinique virtuelle
• Un système de planification hebdomadaire drag-and-drop
• Un programme de fidélité (NourishPoints)

Le Service est actuellement disponible uniquement dans la zone de Tanger et ses environs.`,
  },
  {
    title: "3. Inscription et Compte",
    content: `Pour utiliser le Service, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité effectuée sous votre compte.

Vous devez avoir au moins 18 ans ou disposer de l'autorisation d'un parent/tuteur légal pour souscrire à un abonnement. En cas d'utilisation du Plan Famille, le titulaire du compte principal est responsable de la gestion des profils des membres de sa famille.`,
  },
  {
    title: "4. Abonnements et Tarification",
    content: `Nourishbox propose trois formules d'abonnement :

• Solo : 1 profil, 5 repas/semaine
• Couple : 2 profils, 10 repas/semaine
• Famille : Jusqu'à 4 profils, 20 repas/semaine

Les prix sont affichés en Dirhams marocains (MAD) et incluent la TVA applicable. La facturation est hebdomadaire par défaut, avec option de facturation mensuelle (remise de 15%). La livraison est gratuite sur tous les plans.

Nourishbox se réserve le droit de modifier ses tarifs avec un préavis de 14 jours. Toute modification tarifaire sera communiquée par email et notification in-app.`,
  },
  {
    title: "5. Livraison",
    content: `Les repas sont livrés frais chaque semaine selon le calendrier défini dans votre planificateur. Les livraisons s'effectuent du lundi au vendredi, entre 7h00 et 12h00.

En cas d'absence lors de la livraison, le livreur déposera votre box dans un lieu sécurisé convenu. Nourishbox ne pourra être tenu responsable de la détérioration des repas laissés sans réfrigération.

Toute réclamation concernant une livraison doit être signalée dans les 24 heures suivant la réception via notre centre d'aide.`,
  },
  {
    title: "6. Suspension, Report et Annulation",
    content: `Vous pouvez à tout moment :

• Suspendre votre abonnement : Mettez en pause depuis votre tableau de bord. Aucune facturation pendant la période de suspension.
• Reporter une semaine : Désactivez avant la date limite du jeudi à minuit pour que votre prochaine semaine ne soit pas facturée.
• Annuler votre abonnement : Annulation en 2 clics depuis vos paramètres. Aucune pénalité.

Nourishbox se réserve le droit de suspendre ou résilier un compte en cas de fraude, abus du système de points, ou violation des présentes conditions.`,
  },
  {
    title: "7. Allergènes et Responsabilité Nutritionnelle",
    content: `Bien que Nourishbox s'efforce de respecter vos préférences alimentaires et allergènes déclarés, nos repas sont préparés dans une cuisine où sont manipulés des allergènes courants (gluten, noix, soja, produits laitiers, poisson, crustacés, etc.).

Nourishbox ne peut garantir l'absence totale de traces d'allergènes. Les personnes souffrant d'allergies sévères sont invitées à consulter leur médecin avant de souscrire.

Les calculs nutritionnels sont fournis à titre informatif et ne constituent pas un avis médical. En cas de condition médicale spécifique, consultez un professionnel de santé.`,
  },
  {
    title: "8. Propriété Intellectuelle",
    content: `L'ensemble du contenu de la plateforme Nourishbox — incluant mais non limité aux textes, graphismes, logos, images, recettes, algorithmes et logiciels — est la propriété exclusive de Nourishbox SARL et est protégé par les lois marocaines et internationales sur la propriété intellectuelle.

Toute reproduction, distribution ou utilisation non autorisée du contenu est strictement interdite.`,
  },
  {
    title: "9. Protection des Données",
    content: `Nourishbox s'engage à protéger vos données personnelles conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.

Pour plus de détails sur la collecte, l'utilisation et la protection de vos données, veuillez consulter notre Politique de Confidentialité.`,
  },
  {
    title: "10. Droit Applicable et Juridiction",
    content: `Les présentes Conditions sont régies par le droit marocain. Tout litige relatif à l'interprétation ou l'exécution des présentes conditions sera soumis à la compétence exclusive des tribunaux de Tanger, Maroc.

En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-[140px] pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Scale className="mx-auto mb-6 text-[#C4602A]" size={40} />
          <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight mb-4">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-[#9C9C9C] font-sans text-sm">
            Dernière mise à jour : 1er mai 2026 · Nourishbox SARL — Tanger, Maroc
          </p>
        </motion.div>
      </section>

      {/* ── CONTENT ── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="space-y-10">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.03, duration: 0.5 }}
            >
              <h2 className="font-serif text-xl text-[#1A1A1A] mb-4">{section.title}</h2>
              <div className="text-[#6B6B6B] font-sans leading-[1.8] text-[15px] whitespace-pre-line">
                {section.content}
              </div>
              {i < SECTIONS.length - 1 && <hr className="mt-10 border-[#E8E3DB]" />}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-6 rounded-[20px] bg-[#E8F7F1] border border-[#6BC4A0]/20 text-center"
        >
          <p className="text-sm text-[#085041] font-sans">
            Pour toute question concernant ces conditions, contactez-nous à{" "}
            <a href="mailto:legal@nourishbox.ma" className="font-bold underline">legal@nourishbox.ma</a>
          </p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
