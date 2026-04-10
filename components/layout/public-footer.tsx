"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Twitter, Check } from "lucide-react";
import { useState } from "react";

function FooterLink({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href} className="relative overflow-hidden group block font-sans font-normal text-base text-[#F5F0E8]/65 w-fit">
      <div className="transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[120%] opacity-100 group-hover:opacity-0">
        {text}
      </div>
      <div className="absolute top-0 left-0 text-[#F5F0E8] translate-y-[120%] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
        {text}
      </div>
    </Link>
  );
}

function AppBadge({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}
      className="w-40 md:w-44 h-12 border border-[#C4602A]/20 bg-[#FAFAF7] rounded-[12px] flex items-center justify-center p-1 text-center cursor-pointer text-[#1A1A1A] relative overflow-hidden"
    >
      <AnimatePresence>
        {hovered ? (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 bg-[#2C3E2D] flex items-center justify-center z-10 text-[#F5F0E8]"
          >
            <Check size={20} className="text-[#F5F0E8] font-bold" strokeWidth={3} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span className="text-[10px] md:text-xs font-sans font-bold tracking-widest capitalize relative z-0 truncate">{text}</span>
    </motion.div>
  );
}

function CopyrightText() {
  const text = "© 2026 NOURISHBOX. TOUS DROITS RÉSERVÉS.";
  return (
    <motion.div 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, margin: "100px" }} 
      transition={{ staggerChildren: 0.03, delayChildren: 0.5 }}
      className="flex flex-wrap items-center justify-center md:justify-start"
    >
      <p className="font-sans text-xs font-normal text-[#F5F0E8]/40 flex flex-wrap uppercase tracking-widest leading-[1.6]">
        {text.split("").map((char, index) => (
          <motion.span 
            key={index} 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </p>
    </motion.div>
  );
}

const socials = [
  { Icon: Facebook, name: "Facebook", color: "#1877F2" },
  { Icon: Instagram, name: "Instagram", color: "#E4405F" },
  { Icon: Twitter, name: "Twitter", color: "#1DA1F2" }
];

export function PublicFooter() {
    return (
        <footer className="relative bg-[#1A1A1A] text-[#F5F0E8] py-16 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
            
            {/* Topographic Contour Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60 Q 30 30, 60 60 T 120 60 M0 80 Q 30 50, 60 80 T 120 80 M0 40 Q 30 10, 60 40 T 120 40 M0 100 Q 30 70, 60 100 T 120 100 M0 20 Q 30 -10, 60 20 T 120 20' fill='none' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/svg%3E")`,
                backgroundSize: '240px'
              }}
            />
            
            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] z-20" />

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 sm:gap-16 lg:gap-20 mb-12 sm:mb-20 justify-between">
                
                {/* Left Block: Logo & Bio */}
                <div className="w-full lg:w-1/3 flex flex-col justify-between">
                    <div>
                      {/* Logo */}
                      <div className="mb-10 flex items-center gap-3">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          >
                              <Image src="/logo.png" alt="Nourishbox" width={48} height={48} className="rounded-xl" />
                          </motion.div>
                          <span className="font-serif text-3xl text-[#F5F0E8] tracking-tight">
                              <span className="text-[#A8E6CF]">nourish</span><span className="text-[#C4602A]">box</span>
                          </span>
                      </div>
                      
                      <p className="font-sans font-normal text-[#F5F0E8]/70 mb-10 leading-[1.7] max-w-sm">
                          Nous livrons des repas frais et équilibrés directement à votre porte, rendant le bien-être simple, vibrant et délicieux. Créé en 2026.
                      </p>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-4">
                        {socials.map((social) => (
                           <motion.a 
                             key={social.name}
                             href={`#${social.name}`}
                             whileHover={{ 
                               scale: 1.15, 
                               rotate: 360, 
                               backgroundColor: "#C4602A", 
                               borderColor: "#C4602A",
                               color: "#1A1A1A"
                             }}
                             transition={{ type: "spring", stiffness: 200, damping: 15 }}
                             className="w-12 h-12 border border-[#F5F0E8]/50 bg-transparent flex items-center justify-center text-[#F5F0E8] transition-colors rounded-full"
                           >
                              <social.Icon size={20} />
                           </motion.a>
                        ))}
                    </div>
                </div>

                {/* Middle - Links */}
                <div className="w-full lg:w-[45%] grid grid-cols-2 sm:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-16 rtl:text-right">
                    {[
                        { title: "Produit", links: ["Menu", "Tarifs", "Fonctionnalités"] },
                        { title: "Entreprise", links: ["À Propos", "Carrières", "Presse"] },
                        { title: "Légal", links: ["Conditions", "Confidentialité"] },
                        { title: "Support", links: ["Aide", "Contact"] }
                    ].map((col, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          whileInView={{ opacity: 1, filter: "blur(0px)" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 * idx, duration: 0.6, ease: "easeOut" }}
                          key={col.title}
                        >
                            <h4 className="font-sans font-semibold text-xs tracking-widest mb-8 uppercase text-[#F5F0E8]">{col.title}</h4>
                            <ul className="space-y-6">
                                {col.links.map(link => (
                                    <li key={link}>
                                        <FooterLink text={link} href="#" />
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Far Right Block: Radar World Map */}
                <div className="w-full lg:w-1/4 flex justify-center lg:justify-end">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="w-full max-w-[280px] aspect-[4/3] border border-[#2C3E2D] bg-[#1A1A1A] relative overflow-hidden flex items-center justify-center rounded-2xl shadow-2xl text-[#F5F0E8]"
                    >
                        {/* Static Subdued Map background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #2C3E2D 1px, transparent 1px)", backgroundSize: "10px 10px" }}></div>
                        
                        <div className="absolute w-[140%] h-full flex items-center justify-center opacity-40">
                             <svg viewBox="0 0 100 50" className="w-full h-full fill-[#2C3E2D]">
                                 <path d="M10 25 Q 20 15, 30 25 T 50 25 T 70 25 T 90 25 L 90 50 L 10 50 Z" />
                             </svg>
                        </div>

                        {/* Radar Scan Line */}
                        <motion.div 
                          className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-transparent via-[#C4602A] to-transparent opacity-80 blur-[2px]"
                          initial={{ left: "-10%" }}
                          animate={{ left: "110%" }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Radar Ping rings */}
                        <div className="absolute top-[55%] left-[45%] w-10 h-10 flex items-center justify-center z-10">
                             {[0, 1, 2].map((i) => (
                                 <motion.div
                                   key={i}
                                   className="absolute inset-0 rounded-full border border-[#C4602A]"
                                   initial={{ scale: 0.2, opacity: 1 }}
                                   animate={{ scale: 3.5, opacity: 0 }}
                                   transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                                 />
                             ))}
                             <div className="relative w-2 h-2 bg-[#C4602A] rounded-full shadow-[0_0_8px_#C4602A]"></div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Bar Separator (Animated Draw) */}
            <motion.div 
               initial={{ scaleX: 0 }}
               whileInView={{ scaleX: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="max-w-7xl mx-auto h-[1px] bg-[#C4602A]/40 origin-left mb-8 relative z-10"
            />

            {/* Bottom Bar */}
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
                
                {/* Letter-by-letter copyright */}
                <CopyrightText />

                {/* App Store Checkmark Badges */}
                <div className="flex gap-4">
                   <AppBadge text="APP STORE" />
                   <AppBadge text="GOOGLE PLAY" />
                </div>
            </div>
        </footer>
    );
}

