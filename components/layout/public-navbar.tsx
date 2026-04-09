"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Search, User, ShoppingCart } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SplitTextLink } from "@/components/ui/split-text-link";

const NAV_LINKS = [
  { label: "Le Menu",         href: "/#menu" },
  { label: "Comment ça marche", href: "/#how-it-works" },
  { label: "Notre Histoire",        href: "/about" },
  { label: "Communauté",    href: "/community" },
];

export function PublicNavbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = 2;

  // Track scroll position
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-500
          ${scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-card"
            : "bg-transparent border-b border-transparent"
          }
        `}
      >
        <div className="relative z-10">
          {/* 1. ANNOUNCEMENT BAR */}
          <div className="bg-[#1A261B] text-background py-2 px-4 text-[11px] font-sans font-medium text-center w-full tracking-widest uppercase">
            <span dangerouslySetInnerHTML={{ __html: "NOUVEAU — LIVRAISON GRATUITE SUR TOUTES LES COMMANDES DE PLUS DE <span class='text-[#C4602A] font-bold'>500 MAD</span>" }} />
          </div>

          <div className={`transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

              {/* Logo */}
              <Link href="/" className="flex items-center flex-shrink-0 group">
                <motion.div
                  animate={{ scale: scrolled ? 0.95 : 1 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center font-serif tracking-tight text-2xl"
                >
                  <span className="text-primary group-hover:text-accent transition-colors duration-300">nourish</span>
                  <span className="text-accent group-hover:text-primary transition-colors duration-300">box</span>
                </motion.div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8 lg:gap-10">
                {NAV_LINKS.map((link) => (
                  <motion.div key={link.href} initial="rest" whileHover="hover" animate="rest">
                    <Link
                      href={link.href}
                      className="text-[11px] lg:text-xs font-sans font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors duration-300"
                    >
                      <SplitTextLink>{link.label}</SplitTextLink>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-6">
              
                <Link
                  href="/client/dashboard"
                  className="text-primary hover:text-accent transition-colors duration-300"
                  aria-label="Account"
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
                
                <MagneticButton strength={0.5}>
                  <button
                    onClick={() => router.push("/onboarding")}
                    className="h-11 px-8 rounded-full bg-primary text-background font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#1A1A1A] transition-all shadow-sm active:scale-95"
                  >
                    COMMENCER
                  </button>
                </MagneticButton>
              </div>

              {/* Mobile Hamburger */}
              <div className="md:hidden flex items-center gap-4">
                <button
                  className="p-1.5 text-primary"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={26} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── MOBILE FULL-SCREEN TAKEOVER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[100] bg-[#2C3E2D] flex flex-col px-8 pt-12 pb-10 overflow-hidden text-[#F5F0E8]"
          >
            {/* Grain overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "128px 128px",
              }}
            />

            {/* Close button */}
            <div className="flex items-center justify-between mb-16 relative z-10 w-full">
              <span className="font-serif tracking-tight text-[#F5F0E8] text-2xl">
                <span className="text-[#A8E6CF]">nourish</span><span className="text-[#C4602A]">box</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#F5F0E8] hover:text-[#C4602A] transition-colors"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>

            {/* Nav links — staggered */}
            <motion.nav
              className="flex flex-col gap-2 flex-1 relative z-10"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, x: -40 },
                    show:   { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-5xl sm:text-6xl text-[#F5F0E8] font-medium tracking-tight leading-[0.95] hover:text-[#C4602A] transition-colors duration-300 py-4 border-b border-[#F5F0E8]/10"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Bottom Menu Language & Actions */}
            <motion.div
              className="relative z-10 flex flex-col gap-6 mt-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              
              {/* Mobile Language Toggle removed */}

              <div className="flex gap-6 text-[#F5F0E8]/60 text-sm font-bold tracking-widest capitalize mt-4">
                <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C4602A] transition-colors flex items-center gap-2">
                  <Search size={16} /> Recherche
                </Link>
                <Link href="/client/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C4602A] transition-colors flex items-center gap-2">
                  <User size={16} /> Profil
                </Link>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); router.push("/order"); }}
                className="w-full bg-[#C4602A] text-[#F5F0E8] py-5 text-lg font-medium font-sans tracking-wide hover:bg-[#1A1A1A] transition-colors rounded-[100px] border border-[#C4602A] hover:border-[#1A1A1A]"
              >
                Commander À La Carte
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
