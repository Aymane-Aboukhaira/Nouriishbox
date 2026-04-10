"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check, Sparkles, Smartphone, Mail, Phone, ShieldCheck, Star
} from "lucide-react";
import { useAuthStore, useSubscriptionStore, usePointsStore, useProfileStore } from "@/lib/store";
import { toast } from "sonner";
import type { SubscriptionPlan } from "@/lib/types";

// --- PRICING DATA ---
const PLANS = {
    solo: { name: 'Boîte Solo', weekly: 320 },
    couple: { name: 'Boîte Couple', weekly: 590 },
    family: { name: 'Boîte Famille', weekly: 890 },
};
const FIRST_WEEK_DISCOUNT = 0.10;

// --- CONFETTI COMPONENT ---
function ConfettiBurst() {
    const [show, setShow] = useState(true);

    const pieces = useMemo(() => {
        const colors = ["#6BC4A0", "#F59E0B", "#B09AE0", "#FFA07A"];
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 600, // random(-300, 300)
            y: -100 - Math.random() * 300,  // random(-400, -100)
            rotate: Math.random() * 360,
            duration: 0.8 + Math.random() * 0.6,
            color: colors[i % colors.length]
        }));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setShow(false), 2000);
        return () => clearTimeout(t);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 flex items-center justify-center">
            {pieces.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, scale: 1, rotate: p.rotate, opacity: 0 }}
                    transition={{ duration: p.duration, ease: "easeOut" }}
                    className="absolute w-2.5 h-2.5 rounded-xl"
                    style={{ backgroundColor: p.color }}
                />
            ))}
        </div>
    );
}

// --- MAIN CONTENT ---
function ConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const { user, isAuthenticated } = useAuthStore();
    const { subscription } = useSubscriptionStore();
    const { points } = usePointsStore();
    const { profile } = useProfileStore();

    const [hasMounted, setHasMounted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Read URL Params
    const urlOrderId = searchParams.get("orderId");
    const rawPlan = searchParams.get("plan");
    const planKey = (rawPlan && rawPlan in PLANS) ? (rawPlan as keyof typeof PLANS) : "solo";
    const selectedPlan = PLANS[planKey];

    useEffect(() => { setHasMounted(true); }, []);

    useEffect(() => {
        if (!hasMounted) return;
        
        // Guard — kick to root if not active
        if (!isAuthenticated || subscription.status !== 'active') {
            router.replace("/");
            return;
        }

        // Trigger confetti 700ms after mount (after circle lands)
        const t = setTimeout(() => setShowConfetti(true), 700);
        return () => clearTimeout(t);
    }, [hasMounted, isAuthenticated, subscription.status, router]);

    if (!hasMounted) return null;

    // Derived Data
    const firstName = profile.name ? profile.name.split(" ")[0] : "Bienvenue";
    const finalOrderId = urlOrderId || subscription.id || "NB-00000";
    
    const weeklyPrice = selectedPlan.weekly;
    const chargedToday = Math.round(weeklyPrice * (1 - FIRST_WEEK_DISCOUNT));

    const startDate = new Date(subscription.starts_at || Date.now());
    
    // Dates Calculation
    const nextBillingDate = new Date(startDate);
    nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    const nextBillingStr = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(nextBillingDate);

    let deliveryDaysDelta = 1; // Tomorrow
    const dayOfWeek = startDate.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    if (dayOfWeek === 5 || dayOfWeek === 6) {
        deliveryDaysDelta = 2; // Avoid Sunday deliveries
    }
    
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDaysDelta);
    
    let deliveryLabel = "";
    if (deliveryDaysDelta === 1) {
        deliveryLabel = "Demain, 7h–12h";
    } else {
        const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(deliveryDate);
        deliveryLabel = `${dayName}, 7h–12h`;
    }

    return (
        <div className="min-h-screen bg-[#FFF8F4] flex flex-col relative overflow-hidden">
            {showConfetti && <ConfettiBurst />}

            {/* Minimal Header */}
            <header className="w-full h-24 flex flex-col items-center justify-center bg-[#FFF8F4] z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Nourishbox" width={32} height={32} className="rounded-lg" />
                    <span className="font-serif text-2xl text-[#6BC4A0]">nourishbox</span>
                </div>
                <span className="text-xs text-[#9C9C9C] font-semibold mt-1">Commande confirmée</span>
            </header>

            <main className="w-full max-w-2xl mx-auto px-6 pt-10 pb-24 flex flex-col items-center">
                
                {/* Section 1 — Celebration */}
                <div className="flex flex-col items-center text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full bg-[#6BC4A0] flex items-center justify-center mb-8 shadow-lg shadow-[#6BC4A0]/20"
                    >
                        <motion.div
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                        >
                            <Check size={36} className="text-white" strokeWidth={3} />
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="font-serif text-4xl md:text-5xl text-[#2D2D2D] leading-tight mb-4"
                    >
                        {profile.name ? `Bienvenue chez Nourishbox, ${firstName}.` : firstName + "."}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="text-[#6B6B6B] font-sans md:text-lg"
                    >
                        La commande <span className="font-bold text-[#2D2D2D]">{finalOrderId}</span> est confirmée. Votre première boîte est en préparation.
                    </motion.p>
                </div>

                {/* Section 2 — Order summary card */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="w-full bg-white rounded-[2rem] p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] mb-10"
                >
                    <div className="space-y-4 text-sm md:text-base font-semibold">
                        <div className="flex justify-between">
                            <span className="text-[#9C9C9C]">Commande</span>
                            <span className="text-[#6BC4A0] font-mono font-bold tracking-tight">{finalOrderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9C9C9C]">Forfait</span>
                            <span className="text-[#2D2D2D]">{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9C9C9C]">Facturé aujourd'hui</span>
                            <span className="text-[#2D2D2D]">{chargedToday} MAD</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="text-[#9C9C9C]">Prochaine facturation</span>
                            <span className="text-[#2D2D2D] text-right">{weeklyPrice} MAD le {nextBillingStr}</span>
                        </div>
                    </div>
                    
                    <hr className="border-[#F0EBE3] my-6" />
                    
                    <div className="flex justify-center items-center gap-1.5 w-full">
                        <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                        <span className="text-[#F59E0B] text-xs font-bold capitalize tracking-wide">+100 NourishPoints ajoutés à votre compte</span>
                    </div>
                </motion.div>

                {/* Section 3 — Delivery timeline */}
                <div className="w-full mb-10 pl-2">
                    <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Et ensuite ?</h2>
                    
                    <div className="flex flex-col relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[11px] top-4 bottom-8 w-[2px]"
                            style={{ background: 'linear-gradient(to bottom, #6BC4A0 30%, #E8E0D8 60%)' }}
                        />

                        {[
                            { active: true, title: "Paiement confirmé", time: "À l'instant" },
                            { active: true, title: "Cuisine notifiée", time: "Aujourd'hui, dans l'heure" },
                            { active: false, title: "Repas en préparation", time: "Aujourd'hui avant 18h" },
                            { active: false, title: "En cours de livraison", time: deliveryLabel },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="flex gap-5 mb-8 last:mb-0 relative z-10"
                            >
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 border-2 ${
                                    step.active 
                                    ? "bg-[#6BC4A0] border-[#6BC4A0]" 
                                    : "bg-[#FFF8F4] border-[#6BC4A0] shadow-[inset_0_0_0_2px_#FFF8F4] box-content"
                                }`}>
                                    {step.active && <Check size={14} className="text-white" strokeWidth={3.5} />}
                                    {!step.active && <div className="w-full h-full bg-[#E8E0D8] rounded-full" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${step.active ? "text-[#2D2D2D]" : "text-[#9C9C9C]"}`}>
                                        {step.title}
                                    </h4>
                                    <p className="text-sm text-[#9C9C9C] mt-0.5">{step.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Section 4 — Welcome Points */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="w-full bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-2xl p-5 mb-8 flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={24} className="text-[#F59E0B]" />
                    </div>
                    <div>
                        <p className="font-bold text-[#2D2D2D]">100 points de bienvenue ajoutés</p>
                        <p className="text-sm text-[#9C9C9C]">Solde actuel : {points.balance.toLocaleString()} NourishPoints</p>
                    </div>
                </motion.div>

                {/* Section 5 — App Prompt */}
                <div className="w-full bg-white border border-[#F0EBE3] rounded-2xl p-6 mb-10 shadow-sm text-center">
                    <h3 className="font-serif text-xl text-[#2D2D2D] mb-2">Gérez votre plan où que vous soyez</h3>
                    <p className="text-[#6B6B6B] text-sm mb-6 max-w-sm mx-auto">
                        Suivez vos macros, échangez vos repas et mettez votre abonnement en pause depuis votre téléphone.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button onClick={() => toast("L'application arrive bientôt — restez à l'écoute !")} className="h-11 px-6 rounded-xl border border-[#E8E0D8] text-sm font-bold text-[#2D2D2D] hover:border-[#6BC4A0] hover:text-[#6BC4A0] transition-colors flex items-center justify-center gap-2">
                            <Smartphone size={16} /> App Store
                        </button>
                        <button onClick={() => toast("L'application arrive bientôt — restez à l'écoute !")} className="h-11 px-6 rounded-xl border border-[#E8E0D8] text-sm font-bold text-[#2D2D2D] hover:border-[#6BC4A0] hover:text-[#6BC4A0] transition-colors flex items-center justify-center gap-2">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3.568 1.48C3.155 1.892 2.923 2.522 2.923 3.32v17.38c0 .798.232 1.428.645 1.84L3.6 22.51l9.904-9.923v-.178l-9.904-9.924-.032-.102z"/><path d="m13.484 12.38 3.295 3.298-9.06 5.148c-2.458 1.411-2.458 1.411-4.148-.28L13.484 12.38z" fill="#000"/><path d="m16.897 8.355-3.415 3.414.002.613 3.42 3.42 4.093-2.32c1.173-.664 1.173-1.764 0-2.433l-4.1-2.694z" fill="#000"/><path d="M13.504 12.41 3.57 2.454C5.26.764 5.26.764 7.718 2.175l9.06 5.25-3.274 4.985z" fill="#000"/></svg> 
                            Google Play
                        </button>
                    </div>
                </div>

                {/* Section 6 — Primary CTA */}
                <div className="w-full text-center">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/client/dashboard" className="flex items-center justify-center w-full h-14 bg-[#6BC4A0] hover:bg-[#5BB38F] text-white font-bold text-lg rounded-full shadow-[0_8px_32px_rgba(107,196,160,0.35)] transition-colors mb-6">
                            Aller à mon tableau de bord →
                        </Link>
                    </motion.div>
                    
                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-[#9C9C9C] mb-16">
                        <Link href="/client/planner" className="hover:text-[#6BC4A0] transition-colors">Voir votre plan</Link>
                        <span>·</span>
                        <Link href="/client/menu" className="hover:text-[#6BC4A0] transition-colors">Explorer le menu</Link>
                    </div>
                </div>

                {/* Section 7 — Reassurance Footer Strip */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-10 border-t border-[#F0EBE3] w-full max-w-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#9C9C9C]">
                        <Mail size={14} className="text-[#6BC4A0]" />
                        <span>Confirmation envoyée par email</span>
                    </div>
                    <a href="#" className="flex items-center gap-2 text-xs font-semibold text-[#9C9C9C] hover:text-[#6BC4A0] transition-colors">
                        <Phone size={14} className="text-[#6BC4A0]" />
                        <span>Besoin d'aide ? Contactez-nous sur WhatsApp</span>
                    </a>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#9C9C9C]">
                        <ShieldCheck size={14} className="text-[#6BC4A0]" />
                        <span>Garantie fraîcheur 30 jours</span>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFF8F4]" />}>
            <ConfirmationContent />
        </Suspense>
    );
}
