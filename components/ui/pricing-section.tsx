"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Truck, ArrowRight } from "lucide-react";

function PricingStep({ number, title, desc, index }: { number: string; title: string; desc: string; index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="group relative py-12 overflow-hidden w-full"
        >
            {/* The absolute horizontal separator line for the step */}
            <motion.div 
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.3 + index * 0.15, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-full h-[1px] bg-border origin-left rtl:origin-right"
            />

            <div className="flex flex-col md:flex-row md:items-start gap-4 lg:gap-10 w-full relative z-10 items-start">
                
                {/* HUGE Terracotta Number */}
                <span 
                    className="font-serif text-accent font-bold leading-none select-none shrink-0 tracking-tighter"
                    style={{ fontSize: '150px', marginTop: '-15px' }}
                >
                    {number}
                </span>

                <div className="flex-1 space-y-2 mt-2">
                    <h3 
                        className="font-serif text-text-primary font-bold tracking-tight"
                        style={{ fontSize: '36px' }}
                    >
                        {title}
                    </h3>
                    <p 
                        className="font-sans text-text-muted leading-relaxed"
                        style={{ fontSize: '18px' }}
                    >
                        {desc}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function DiscountRow({ label, discount, delay }: { label: string, discount: string, delay: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 + delay, duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-between py-1.5 w-full"
        >
            <span 
                className="font-sans uppercase font-medium whitespace-nowrap tracking-widest"
                style={{ fontSize: '15px', color: '#F5F0E8', opacity: 0.8 }}
            >
                {label}
            </span>
            
            {/* Dashed Line Animation */}
            <div className="flex-1 mx-4 lg:mx-6 flex items-center h-[2px]">
                <motion.svg 
                    width="100%" 
                    height="2" 
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
                    transition={{ duration: 1.2, delay: 0.6 + delay, ease: [0.22, 1, 0.36, 1] }}
                >
                    <line 
                        x1="0" y1="1" x2="100%" y2="1"
                        stroke="#F5F0E8"
                        strokeWidth="2"
                        strokeDasharray="4 6"
                        strokeOpacity="0.4"
                    />
                </motion.svg>
            </div>

            <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ 
                    type: "spring", 
                    stiffness: 350, 
                    damping: 25, 
                    delay: 0.8 + delay 
                }}
                className="bg-accent rounded-full font-bold tracking-widest tabular-nums shrink-0"
                style={{ fontSize: '14px', color: '#FFFFFF', padding: '6px 14px' }}
            >
                {discount}
            </motion.span>
        </motion.div>
    );
}

export function PricingSection() {
    const headingRef = useRef(null);
    const isHeadingInView = useInView(headingRef, { once: true });
    
    const cardRef = useRef(null);
    const isCardInView = useInView(cardRef, { once: true, margin: "-100px" });

    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        if (isCardInView) {
            const controls = animate(count, 55, { duration: 2, ease: "easeOut", delay: 0.2 });
            return controls.stop;
        }
    }, [isCardInView, count]);

    const titleWords = 'Simple et Transparent.'.split(" ");

    return (
        <section id="pricing" className="py-24 lg:py-40 px-6 border-y border-border overflow-hidden relative" style={{ backgroundColor: '#F5F0E8' }}>
            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Heading Area */}
                <div ref={headingRef} className="mb-20 lg:mb-28 w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-block mb-6"
                    >
                        <span className="text-sm font-bold text-accent uppercase tracking-[0.2em]">
                            TARIFICATION
                        </span>
                    </motion.div>
                    
                    <h2 
                        className="font-serif text-text-primary mb-6 tracking-tighter leading-[0.95] font-black w-full"
                        style={{ fontSize: 'clamp(4rem, 8vw, 8.5rem)' }}
                    >
                        {titleWords.map((word, i) => (
                            <span key={i}>
                                <motion.span
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: i * 0.08, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                    className="inline-block"
                                >
                                    {word}
                                </motion.span>
                                {i < titleWords.length - 1 && <span>&nbsp;</span>}
                            </span>
                        ))}
                    </h2>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={isHeadingInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-lg lg:text-2xl text-text-muted font-sans max-w-2xl leading-relaxed font-medium"
                    >
                        Payez uniquement ce que vous choisissez. Aucun abonnement fixe. Aucune surprise.
                    </motion.p>
                </div>

                <div style={{ overflowX: 'hidden', paddingBottom: '40px' }}>
                    <div 
                        className="w-full"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: '80px',
                            flexWrap: 'wrap'
                        }}
                    >
                        
                        {/* LEFT COLUMN: Steps */}
                        <div 
                            className="relative flex flex-col"
                            style={{ flex: '1.5', minWidth: '320px' }}
                        >
                        <PricingStep 
                            number="01" 
                            title="Choisissez vos repas" 
                            desc="Sélectionnez parmi notre menu de plats frais et de saison. Pas de menu imposé, vous avez le contrôle total."
                            index={0}
                        />
                        <PricingStep 
                            number="02" 
                            title="Préparation & Macro" 
                            desc="Nos chefs préparent chaque repas en fonction de l'équilibre parfait de macros pour votre journée."
                            index={1}
                        />
                        <PricingStep 
                            number="03" 
                            title="Livraison" 
                            desc="Livraison fraîche et gratuite à Tanger. Des emballages éco-responsables directement à votre porte."
                            index={2}
                        />
                    </div>

                    {/* RIGHT COLUMN: Price Card */}
                    <div 
                        className="relative"
                        style={{ flex: '1', minWidth: '380px' }}
                    >
                        <motion.div
                            ref={cardRef}
                            initial={{ opacity: 0, scale: 0.95, x: 30 }}
                            animate={isCardInView ? { opacity: 1, scale: 1, x: 0 } : {}}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-[24px] lg:rounded-[32px] p-8 lg:p-12 relative overflow-hidden w-full"
                            style={{ backgroundColor: '#2C3E2D', boxShadow: '0 40px 100px -20px rgba(44,62,45,0.4)' }}
                        >
                            <div className="relative z-10 w-full flex flex-col">
                                {/* Top: Label */}
                                <div className="mb-4">
                                    <span 
                                        className="block font-semibold uppercase tracking-[0.25em] font-sans"
                                        style={{ fontSize: '13px', color: '#F5F0E8', opacity: 0.7 }}
                                    >
                                        À PARTIR DE
                                    </span>
                                </div>
                                
                                {/* Price Enormous Number */}
                                <div className="flex items-baseline gap-4 mb-10 w-full rtl:flex-row-reverse rtl:justify-end">
                                    <motion.span 
                                        className="font-serif font-bold leading-none tracking-tighter"
                                        style={{ fontSize: '140px', color: '#F5F0E8' }}
                                    >
                                        {rounded}
                                    </motion.span>
                                    <div className="pb-4">
                                        <span 
                                            className="block font-sans font-medium whitespace-nowrap"
                                            style={{ fontSize: '18px', color: '#F5F0E8', opacity: 0.8 }}
                                        >
                                            MAD / repas
                                        </span>
                                    </div>
                                </div>

                                {/* Divider line in card */}
                                <div className="w-full h-[1px] bg-accent/50 mb-10" />

                                {/* Middle: Discounts */}
                                <div className="space-y-6 lg:space-y-8 mb-12 w-full">
                                    <span 
                                        className="block font-semibold uppercase tracking-[0.25em] font-sans mb-4"
                                        style={{ fontSize: '13px', color: '#F5F0E8', opacity: 0.6 }}
                                    >
                                        RÉDUCTIONS QUANTITÉ
                                    </span>
                                    <div className="space-y-3 lg:space-y-4 w-full">
                                        <DiscountRow label="6 à 9 repas" discount="-8%" delay={0.1} />
                                        <DiscountRow label="10 à 14 repas" discount="-12%" delay={0.2} />
                                        <DiscountRow label="15+ repas" discount="-15%" delay={0.3} />
                                    </div>
                                </div>

                                {/* Bottom: Truck & CTA */}
                                <div className="space-y-8 pt-2 w-full">
                                    <div className="flex items-center gap-4 font-sans font-medium">
                                        <Truck size={22} style={{ color: '#F5F0E8' }} />
                                        <span className="tracking-wide" style={{ fontSize: '18px', color: '#F5F0E8' }}>
                                            Livraison Gratuite Incluse
                                        </span>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-5 lg:py-6 hover:bg-accent rounded-3xl font-sans font-semibold uppercase tracking-[0.15em] transition-colors duration-300 flex items-center justify-center gap-4 group"
                                        style={{ backgroundColor: '#384A39', color: '#F5F0E8', fontSize: '16px' }}
                                        onClick={() => window.location.href = "/onboarding"}
                                    >
                                        <span>CRÉER MA BOX</span>
                                        <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-1.5 transition-transform duration-300 rtl:group-hover:-translate-x-1.5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
                </div>
            </div>
        </section>
    );
}
