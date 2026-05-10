"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ChefHat, BarChart2, Truck, PauseCircle,
    Stethoscope, TrendingUp, Pause, SkipForward, X, ChevronDown, ArrowRight
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { PricingSection } from "@/components/ui/pricing-section";

const FAQS = [
    { q: "Que se passe-t-il après ma première semaine — suis-je engagé ?", a: "Pas du tout. Nourishbox est totalement flexible. Après votre première box, vous continuez de semaine en semaine sans engagement minimum. Suspendez, reportez ou annulez à tout moment depuis votre tableau de bord." },
    { q: "La livraison est-elle vraiment gratuite sur tous les plans ?", a: "Oui, toujours. La livraison gratuite est incluse sur chaque plan, chaque semaine, sans montant minimum de commande. Nous livrons sur tout Tanger." },
    { q: "Puis-je changer de plan au milieu de mon abonnement ?", a: "Oui. Vous pouvez modifier votre abonnement à tout moment depuis vos paramètres. Les changements prennent effet dès votre prochain cycle hebdomadaire." },
    { q: "Quelle est la date limite pour reporter ou suspendre une semaine ?", a: "Le jeudi à minuit. Si vous suspendez avant jeudi minuit, votre prochaine semaine est annulée et vous n'êtes pas débité." },
    { q: "Proposez-vous des remises pour étudiants ou parrainage ?", a: "Nous avons un programme de parrainage — partagez votre code et gagnez 50 MAD de crédit pour chaque ami qui s'abonne. Les remises étudiantes arrivent bientôt." },
    { q: "Comment fonctionne la facturation — hebdomadaire ou mensuelle ?", a: "Par défaut, vous êtes facturé chaque semaine le lundi. Vous pouvez passer à une facturation mensuelle (et économiser 15%) à tout moment." }
];

export default function PricingPage() {
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#FFF8F4] flex flex-col pt-[88px]">
            <PublicNavbar />

            <main className="flex-1">
                
                {/* 1. Flexible Pricing Section from main page */}
                <PricingSection />

                {/* 2. Per-meal cost visualiser */}
                <section className="max-w-4xl mx-auto px-6 py-24">
                    <div className="bg-[#FFF8F4] border border-[#F0E4D8] rounded-[2rem] p-8 md:p-12 shadow-[0_12px_40px_rgba(45,45,45,0.06)] relative overflow-hidden text-center md:text-left">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6BC4A0]/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

                        <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] mb-10 text-center">Comment ça se compare ?</h2>

                        <div className="space-y-6 max-w-2xl mx-auto">
                            {[
                                { label: "Nourishbox (Moyenne)", price: 55, pct: "11%", color: "#6BC4A0" },
                                { label: "Restaurant (Moyenne Tanger)", price: 120, pct: "24%", color: "#D1CBC3" },
                                { label: "Session Nutritionniste", price: 500, pct: "100%", color: "#D1CBC3" }
                            ].map((row, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <span className="w-[200px] text-sm font-bold text-[#2D2D2D] md:text-right shrink-0">{row.label}</span>
                                    <div className="flex-1 h-6 bg-white rounded-full overflow-hidden border border-[#F0E4D8] relative">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            whileInView={{ width: row.pct }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.15 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: row.color }}
                                        />
                                    </div>
                                    <span className="w-20 text-sm font-bold text-[#2D2D2D] text-left">{row.price} MAD</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-[#9C9C9C] mt-8 pt-8 border-t border-[#F0EBE3] max-w-xl mx-auto">
                            Le prix par repas comprend la préparation, le calcul des macros, l'emballage et la livraison gratuite à domicile.
                        </p>
                    </div>
                </section>

                {/* 3. What's always included */}
                <section className="bg-white py-24 px-6 border-y border-[#F0E4D8]">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] mb-12 text-center">Inclus dans chaque commande</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: ChefHat, bg: "#E8F7F1", color: "#6BC4A0", title: "Repas de Chef", desc: "Cuisinés frais, portionnés selon vos macros exactes" },
                                { icon: BarChart2, bg: "#F0EDF9", color: "#B09AE0", title: "Planification des Macros", desc: "Votre plan hebdomadaire élaboré selon vos objectifs personnels" },
                                { icon: Truck, bg: "#E8F7F1", color: "#6BC4A0", title: "Livraison Gratuite", desc: "À votre porte chaque semaine, sans commande minimum" },
                                { icon: PauseCircle, bg: "#FFF0EA", color: "#FFA07A", title: "Pausez à tout moment", desc: "Besoin d'une pause ? Un clic suffit depuis votre dashboard" },
                                { icon: Stethoscope, bg: "#F0EDF9", color: "#B09AE0", title: "Clinique de Nutrition Virtuelle", desc: "Discutez avec notre nutritionniste IA à tout moment" },
                                { icon: TrendingUp, bg: "#FFF9DB", color: "#F59E0B", title: "Suivi des Progrès", desc: "Streaks, badges et graphiques d'adhérence à vos objectifs" }
                            ].map((feat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.5 }}
                                    className="p-5 rounded-2xl border border-black/5"
                                    style={{ backgroundColor: feat.bg }}
                                >
                                    <feat.icon size={24} color={feat.color} className="mb-4" />
                                    <h4 className="font-bold text-[#2D2D2D] mb-1">{feat.title}</h4>
                                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Flexibility Guarantees */}
                <section className="max-w-4xl mx-auto px-6 py-24">
                    <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] mb-12 text-center md:text-left">Vous gardez le contrôle</h2>
                    <div className="space-y-6">
                        {[
                            { icon: Pause, title: "Pausez quand vous voulez", desc: "En vacances ? Suspendez depuis votre tableau de bord. Pas de formulaires, pas de pénalités." },
                            { icon: SkipForward, title: "Reportez une semaine", desc: "Désactivez simplement avant la limite du jeudi. Rien ne vous sera facturé." },
                            { icon: X, title: "Annulation en 2 clics", desc: "Nous serons tristes de vous voir partir, mais il n'y a aucun barrage. C'est simple et direct." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="bg-white rounded-r-xl border-l-[3px] border-[#6BC4A0] pl-5 py-4 pr-6 shadow-sm flex items-start gap-4"
                            >
                                <div className="mt-1 bg-[#F1FAF4] p-2 rounded-xl text-[#6BC4A0] shrink-0">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2D2D2D] text-lg mb-1">{item.title}</h4>
                                    <p className="text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 5. Testimonials */}
                <section className="bg-[#FFF8F4] py-24 px-6 border-y border-[#F0E4D8]">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] mb-12 text-center">Ce que disent nos membres</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    q: "J'étais sceptique sur le prix mais honnêtement le coût par repas est moins élevé que mon déjeuner habituel au centre de Tanger. Et je mange enfin équilibré.",
                                    author: "Mehdi T., Tanger",
                                    date: "Membre depuis Jan 2025"
                                },
                                {
                                    q: "J'ai suspendu pendant un mois lors d'un déplacement et j'ai repris en un seul clic. Pas de culpabilité, pas de service client à appeler.",
                                    author: "Ines B., Tanger",
                                    date: "Membre depuis Mars 2025"
                                }
                            ].map((test, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 24, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12, duration: 0.6 }}
                                    className="bg-[#FFF8F4] rounded-[2rem] p-8 border border-[#EDE8E0] shadow-sm relative"
                                >
                                    <div className="text-[#F59E0B] flex gap-1 mb-6">
                                        {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
                                    </div>
                                    <p className="font-sans italic text-lg text-[#2D2D2D] leading-relaxed mb-6">"{test.q}"</p>
                                    <div>
                                        <p className="text-sm font-bold text-[#6B6B6B]">{test.author}</p>
                                        <p className="text-xs text-[#9C9C9C]">{test.date}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. FAQ Accordion */}
                <section className="max-w-3xl mx-auto px-6 py-24">
                    <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] mb-12 text-center">Questions fréquentes</h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <div key={i} className="border border-[#F0E4D8] rounded-[1.5rem] bg-white overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="font-bold text-lg text-[#2D2D2D]">{faq.q}</span>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                            <ChevronDown size={20} className="text-[#6BC4A0]" />
                                        </motion.div>
                                    </button>
                                    <motion.div
                                        variants={{
                                            open: { height: 'auto', opacity: 1 },
                                            closed: { height: 0, opacity: 0 }
                                        }}
                                        initial="closed"
                                        animate={isOpen ? "open" : "closed"}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-6 pb-6 text-[#6B6B6B] leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 7. Final Conversion Banner */}
                <section className="max-w-7xl mx-auto px-6 mb-24">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#6BC4A0]/10 rounded-[3rem] py-16 px-8 text-center border border-[#6BC4A0]/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-10 w-64 h-64 bg-[#6BC4A0]/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                        <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] mb-4">Vos macros. Vos repas. Votre rythme.</h2>
                        <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto mb-10">Commencez par une évaluation gratuite de 2 minutes. Aucun paiement requis avant d'avoir choisi votre plan.</p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/onboarding")}
                            className="bg-[#6BC4A0] text-white px-10 py-5 rounded-full text-xl font-bold shadow-[0_8px_32px_rgba(107,196,160,0.3)] hover:bg-[#5BB38F] transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            Obtenir mon plan gratuit <ArrowRight size={22} />
                        </motion.button>
                        <p className="text-xs text-[#9C9C9C] font-semibold tracking-wide mt-6 capitalize">
                            Prend 2 minutes · Sans engagement · Annulez à tout moment
                        </p>
                    </motion.div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
