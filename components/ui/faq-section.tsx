"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

function RollNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Create array from 00 up to value
  const items = Array.from({ length: value + 1 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div ref={ref} className="h-10 overflow-hidden relative font-serif font-light text-4xl lg:text-5xl text-[#1A1A1A]/20 mr-6 md:mr-10 rtl:mr-0 rtl:ml-6 rtl:md:ml-10 w-12 md:w-16 shrink-0 flex flex-col justify-start select-none">
      <motion.div
        initial={{ y: 0 }}
        animate={isInView ? { y: `-${value * 2.5}rem` } : { y: 0 }}
        transition={{ type: "spring", stiffness: 40, damping: 14, delay: value * 0.1 }}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {items.map((n, i) => (
          <div key={i} className="h-10 flex items-center justify-start tabular-nums leading-none">
            {n}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const FAQs = [
    { q: "Puis-je annuler ou mettre en pause mon abonnement ?", a: "Absolument. Vous pouvez mettre en pause ou annuler votre abonnement à tout moment sans frais cachés. Faites-le simplement avant la limite hebdomadaire." },
    { q: "Comment calculez-vous mes macros ?", a: "Nous utilisons l'équation cliniquement validée de Mifflin-St Jeor, modifiée par votre niveau d'activité unique et vos objectifs (perte de gras, maintien, ou prise de masse)." },
    { q: "Où livrez-vous vos repas ?", a: "Actuellement, nous opérons uniquement à Tanger pour garantir la fraîcheur absolue de nos livraisons." },
    { q: "Puis-je choisir mes propres repas ?", a: "Les deux ! Nous générons automatiquement un menu parfait basé sur vos macros, mais vous pouvez échanger n'importe quel repas facilement dans votre planificateur." },
    { q: "Puis-je commander pour le reste de ma famille ?", a: "Oui. Notre plan familial vous permet de définir des profils et des portions individuels pour votre partenaire et vos enfants." },
    { q: "Qu'en est-il des allergies ?", a: "Lors de votre inscription, vous pouvez spécifier des préférences (Végétalien, Sans Gluten) ou des allergies spécifiques, et nous filtrerons automatiquement votre menu." }
  ];
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const faqParallax = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section 
      ref={sectionRef} 
      className="relative py-40 bg-[#FAFAF7] overflow-hidden border-t border-[#1A1A1A]/10"
    >
      {/* Background Notebook Ruled Lines */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40" 
        style={{ 
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(26,26,26,0.06) 40px)', 
          backgroundSize: '100% 40px' 
        }} 
      />

      {/* Parallax FAQ Watermark */}
      <motion.div 
        style={{ y: faqParallax }} 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden"
      >
        <span className="text-[35vw] font-black text-[#1A1A1A]/5 tracking-tighter capitalize whitespace-nowrap leading-none mix-blend-multiply">
          FAQ
        </span>
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="font-serif font-bold text-5xl md:text-7xl text-[#1A1A1A] capitalize tracking-tight">
            Questions Fréquentes
          </h2>
        </div>

        <div className="flex flex-col">
          {FAQs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="relative group flex flex-col">
                
                {/* Thin animated separator line (draws left to right on scroll-in) */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                  className="w-full h-[1px] bg-[#1A1A1A]/10 origin-left text-[#F5F0E8]"
                />

                <div 
                  className="relative overflow-hidden cursor-pointer w-full transition-colors rounded-xl" 
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  {/* Light green wash hover background (wipe left to right) */}
                  <div className="absolute inset-0 bg-[#E8F0EA] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out z-0 mix-blend-multiply" />

                  <div className="relative z-10 py-10 px-4 md:px-8 flex items-center justify-between min-h-[100px]">
                    
                    <div className="flex items-center flex-1">
                      {/* Animated Roll Number */}
                      <RollNumber value={i + 1} />
                      
                      {/* Question Text */}
                      <span className="font-sans font-semibold text-lg text-[#1A1A1A] leading-relaxed mr-8 transition-colors group-hover:text-[#2C3E2D]">
                        {faq.q}
                      </span>
                    </div>

                    {/* Morphing '+' to '-' Icon */}
                    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-[#2C3E2D] rounded-full text-[#F5F0E8] shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                        {/* Horizontal Line always visible */}
                        <path d="M5 12H19" />
                        {/* Vertical line morphs completely away */}
                        <motion.path 
                          initial={false}
                          animate={{ d: isOpen ? "M12 12V12" : "M12 5V19" }} 
                          transition={{ duration: 0.3, ease: "easeInOut" }} 
                        />
                      </svg>
                    </div>

                  </div>

                  {/* Expand/Collapse Answer Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, filter: "blur(12px)" }}
                        animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                        exit={{ height: 0, opacity: 0, filter: "blur(12px)" }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} // Springy opening
                        className="relative z-10 origin-top"
                      >
                        {/* Offsets padding to align with the text, bypassing the number width */}
                        <div className="pl-[5.5rem] md:pl-[8rem] pr-8 pb-12 pt-2 font-sans font-normal text-[#1A1A1A]/75 text-base md:text-lg leading-[1.8] max-w-3xl">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            );
          })}
          
          {/* Final closing line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: FAQs.length * 0.1 }}
            className="w-full h-[1px] bg-[#1A1A1A]/10 origin-left text-[#F5F0E8]"
          />
        </div>
      </div>
    </section>
  );
}
