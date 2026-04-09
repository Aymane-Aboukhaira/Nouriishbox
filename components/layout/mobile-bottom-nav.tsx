"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, UtensilsCrossed, CalendarDays, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/client/dashboard", label: "Accueil", Icon: Home },
  { href: "/client/menu", label: "Menu", Icon: UtensilsCrossed },
  { href: "/client/planner", label: "Planifier", Icon: CalendarDays },
  { href: "/client/clinic", label: "IA Clinic", Icon: MessageCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 backdrop-blur-xl border-t border-[#F0E4D8] safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative min-h-[44px] min-w-[44px] justify-center"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-[#2C3E2D] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={isActive ? "text-[#2C3E2D]" : "text-[#9C9C9C]"}
              />
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  isActive ? "text-[#2C3E2D]" : "text-[#9C9C9C]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
