"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { ArrowRight, Truck } from "lucide-react";

interface StepProps {
    number: string;
    title: string;
    description: string;
    index: number;
}

function PricingStep({ number, title, description, index }: StepProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative py-12 lg:py-16"
        >
            <div className="flex flex-col md:flex-row md:items-start gap-8 lg:gap-16">
                {/* Clean Solid Terracotta Step Number */}
                <span className="font-serif text-7xl lg:text-8xl text-accent font-bold leading-none select-none">
                    {number}
                </span>

                <div className="flex-1 space-y-4">
                    <h3 className="font-serif text-3xl lg:text-4xl text-text-primary font-semibold italic">
                        {title}
                    </h3>
                    <p className="font-sans text-text-muted text-lg lg:text-xl max-w-lg leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            {/* Animated Divider line */}
            <motion.div 
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-full h-[1px] bg-border origin-left"
            />
        </motion.div>
    );
}

function DiscountRow({ label, discount, delay }: { label: string, discount: string, delay: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 + delay, duration: 0.8 }}
            className="flex items-center justify-between gap-6 py-5"
        >
            <span className="font-sans text-base lg:text-lg tracking-widest text-[#F5F0E8]/80 uppercase font-bold">
                {label}
            </span>
            
            {/* Dashed Line Animation */}
            <div className="flex-1 h-[1px] relative overflow-hidden">
                <svg width="100%" height="1" className="absolute inset-0">
                    <motion.line 
                        x1="0" y1="0.5" x2="100%" y2="0.5"
                        stroke="#F5F0E8"
                        strokeWidth="1.5"
                        strokeDasharray="6 6"
                        strokeOpacity="0.3"
                        initial={{ pathLength: 0 }}
                        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                        transition={{ duration: 1.2, delay: 0.6 + delay }}
                    />
                </svg>
            </div>

            <motion.span 
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20, 
                    delay: 0.8 + delay 
                }}
                className="bg-accent text-[#F5F0E8] px-5 py-2 rounded-full text-xs lg:text-sm font-black tracking-[0.1em]"
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

    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (isCardInView) {
            let start = 0;
            const target = 55;
            const duration = 1500;
            const increment = target / (duration / 16);
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= target) {
                    setPrice(target);
                    clearInterval(timer);
                } else {
                    setPrice(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [isCardInView]);

    const titleWords = "Simple et Transparent.".split(" ");

    return (
        <section id="pricing" className="py-32 lg:py-48 px-6 bg-[#F5F0E8] border-y border-border overflow-hidden">
            <div className="max-w-7xl mx-auto">
                
                {/* Heading Area */}
                <div ref={headingRef} className="mb-24 lg:mb-32">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-block text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-4"
                    >
                        Tarification
                    </motion.span>
                    <h2 className="font-serif text-5xl lg:text-8xl text-text-primary mb-8 tracking-tight leading-[0.9]">
                        {titleWords.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className="inline-block mr-4 lg:mr-8"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={isHeadingInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-xl lg:text-2xl text-text-muted font-sans max-w-2xl leading-relaxed"
                    >
                        Payez uniquement ce que vous choisissez. Aucun abonnement fixe. Aucune surprise.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
                    
                    {/* LEFT COLUMN: Steps */}
                    <div className="space-y-0">
                        <PricingStep 
                            number="01" 
                            title="Choisissez vos repas" 
                            description="Chaque repas a son propre prix, comme dans un restaurant."
                            index={0}
                        />
                        <PricingStep 
                            number="02" 
                            title="Choisissez vos jours" 
                            description="De 3 à 7 livraisons par semaine, selon votre rythme."
                            index={1}
                        />
                        <PricingStep 
                            number="03" 
                            title="Choisissez vos personnes" 
                            description="Les réductions s'appliquent automatiquement dès 2 personnes."
                            index={2}
                        />
                    </div>

                    {/* RIGHT COLUMN: Price Card */}
                    <motion.div
                        ref={cardRef}
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={isCardInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#2C3E2D] rounded-[40px] p-10 lg:p-16 shadow-[0_40px_100px_-20px_rgba(44,62,45,0.4)] relative"
                    >
                        {/* Top: Price */}
                        <div className="mb-12">
                            <span className="block text-[10px] font-bold text-[#F5F0E8]/60 uppercase tracking-[0.3em] mb-4">
                                À PARTIR DE
                            </span>
                            <div className="flex items-baseline gap-4">
                                <span className="font-serif text-[100px] lg:text-[140px] text-[#F5F0E8] leading-none tracking-tight">
                                    {price}
                                </span>
                                <div className="pb-4 lg:pb-8">
                                    <span className="block text-lg lg:text-xl font-sans text-[#F5F0E8]/70 font-medium">
                                        MAD / repas
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-[1px] bg-accent/30 mb-12" />

                        {/* Middle: Discounts */}
                        <div className="space-y-8 mb-16">
                            <span className="block text-[10px] font-bold text-[#F5F0E8]/50 uppercase tracking-[0.3em] mb-6">
                                RÉDUCTIONS GROUPE
                            </span>
                            <div className="space-y-4">
                                <DiscountRow label="2 personnes" discount="-8%" delay={0.1} />
                                <DiscountRow label="3 personnes" discount="-12%" delay={0.2} />
                                <DiscountRow label="4+ personnes" discount="-15%" delay={0.3} />
                            </div>
                        </div>

                        {/* Bottom: Truck & CTA */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-3 text-[#F5F0E8] font-sans font-medium">
                                <div className="p-2 bg-[#F5F0E8]/10 rounded-lg">
                                    <Truck size={20} className="text-[#F5F0E8]" />
                                </div>
                                <span className="tracking-wide">Livraison offerte</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "#C4602A", color: "#F5F0E8" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-6 bg-[#3D523E] text-[#F5F0E8] rounded-full font-sans font-bold text-lg uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
                                onClick={() => window.location.href = "/onboarding"}
                            >
                                <span>Construire mon plan</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </div>
                        
                        {/* Decorative bloom */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
