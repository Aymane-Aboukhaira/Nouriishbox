"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Calendar,
    Users,
    BarChart3,
    MessageCircle,
    Settings,
    ChevronRight,
    Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLIENT_NAV = [
    { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/client/planner", label: "Planificateur", icon: Calendar },
    { href: "/client/family", label: "Family Hub", icon: Users },
    { href: "/client/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/client/clinic", label: "Clinique IA", icon: MessageCircle },
];

const ADMIN_NAV = [
    { href: "/admin/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: "/admin/menu", label: "Menu Builder", icon: UtensilsCrossed },
    { href: "/admin/orders", label: "Commandes", icon: Calendar },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
];

interface SidebarProps {
    variant?: "client" | "admin";
}

export function Sidebar({ variant = "client" }: SidebarProps) {
    const pathname = usePathname();
    const navItems = variant === "admin" ? ADMIN_NAV : CLIENT_NAV;
    const isAdmin = variant === "admin";

    return (
        <aside className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col z-40 bg-primary text-background shadow-2xl border-r border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-3 px-8 py-10">
                <Link href="/" className="flex items-center gap-2.5 font-serif tracking-tight text-2xl group">
                    <Image src="/logo.png" alt="Nourishbox" width={36} height={36} className="rounded-lg" />
                    <span>
                        <span className="text-background group-hover:text-accent transition-colors duration-300">nourish</span>
                        <span className="text-accent group-hover:text-background transition-colors duration-300">box</span>
                    </span>
                </Link>
                {isAdmin && (
                    <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
                        ADMIN
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer font-sans font-medium text-sm",
                                isActive
                                    ? "text-background"
                                    : "text-background/60 hover:text-background hover:bg-white/5"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId={`sidebar-active-${variant}`}
                                        className="absolute inset-0 rounded-xl bg-accent select-none"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon size={20} strokeWidth={1.5} className={cn("relative z-10 transition-colors", isActive ? "text-background" : "text-background/50 group-hover:text-background")} />
                                <span className="relative z-10 tracking-wide">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId={`sidebar-active-indicator-${variant}`}
                                        className="absolute right-3 w-1 h-1 rounded-full bg-background relative z-10"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User/Settings */}
            <div className="px-4 pb-8 space-y-1">
                <div className="h-[1px] bg-white/5 mx-4 mb-4" />
                <Link href="/settings">
                    <div className="flex items-center gap-4 px-5 py-3 rounded-xl text-background/60 hover:text-background hover:bg-white/5 transition-all cursor-pointer text-sm font-medium font-sans">
                        <Settings size={18} strokeWidth={1.5} className="text-background/40" />
                        <span className="tracking-wide">Settings</span>
                    </div>
                </Link>
                {isAdmin ? (
                    <Link href="/client/dashboard">
                        <div className="flex items-center gap-4 px-5 py-3 rounded-xl text-background/60 hover:text-background hover:bg-white/5 transition-all cursor-pointer text-sm font-medium font-sans">
                            <LayoutDashboard size={18} strokeWidth={1.5} className="text-background/40" />
                            <span className="tracking-wide">Client View</span>
                        </div>
                    </Link>
                ) : (
                    <Link href="/admin/dashboard">
                        <div className="flex items-center gap-4 px-5 py-3 rounded-xl text-background/60 hover:text-background hover:bg-white/5 transition-all cursor-pointer text-sm font-medium font-sans">
                            <BarChart3 size={18} strokeWidth={1.5} className="text-background/40" />
                            <span className="tracking-wide">Admin Hub</span>
                        </div>
                    </Link>
                )}
            </div>
        </aside>
    );
}
