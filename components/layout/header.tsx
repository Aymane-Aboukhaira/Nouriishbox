import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Leaf, ChevronDown, LogOut, Flame, Calendar as CalIcon, Sparkles, Trophy, X, Check } from "lucide-react";
import { usePointsStore, useAuthStore, useNotificationStore, usePlannerStore } from "@/lib/store";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const router = useRouter();
    const { points, todayConsumed } = usePointsStore();
    const { user, signOut } = useAuthStore();
    const { notifications, addNotification, markAsRead, markAllAsRead } = useNotificationStore();
    const { plan } = usePlannerStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Concierge Engine (Smart Notification Generator)
    useEffect(() => {
        const now = new Date();
        const unreadLast24h = (type: string) => notifications.some(n => 
            n.type === type && !n.isRead && new Date(n.createdAt).getTime() > now.getTime() - 86400000
        );

        // 1. Streak Warning
        if (points.streak && points.streak > 2 && todayConsumed.kcal === 0) {
            if (!unreadLast24h('streak')) {
                addNotification({
                    type: 'streak',
                    title: `Your ${points.streak}-day streak resets tonight`,
                    message: "Log a meal before midnight.",
                    actionLink: '/client/dashboard'
                });
            }
        }

        // 2. Planner Cutoff Warning
        const isWednesday = now.getDay() === 3;
        const totalPlanned = plan.planned_meals.length;
        if (isWednesday && totalPlanned < 7) {
            if (!unreadLast24h('planner')) {
                addNotification({
                    type: 'planner',
                    title: "Thursday cutoff approaching",
                    message: "You have gaps in your week. Fill them now.",
                    actionLink: '/client/planner'
                });
            }
        }
    }, [points.streak, todayConsumed.kcal, plan.planned_meals.length, notifications, addNotification]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const displayName = user?.name ?? "Member";
    const initial = displayName.charAt(0).toUpperCase();

    const handleSignOut = () => {
        signOut();
        router.push("/");
    };

    return (
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-[#FFF8F4]/80 backdrop-blur-md sticky top-0 z-30"
            style={{ borderBottom: "1px solid #F0E4D8" }}>
            {/* Page title */}
            <div>
                <h1 className="font-serif text-xl sm:text-2xl text-[#2D2D2D] leading-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-[#9C9C9C] font-medium mt-0.5">{subtitle}</p>
                )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* NourishPoints Badge */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl cursor-pointer"
                    style={{
                        background: "linear-gradient(135deg, #F1FAF4, #A8E6CF30)",
                        border: "1px solid #A8E6CF",
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Leaf size={16} className="text-[#2F8B60]" />
                    </motion.div>
                    <span className="text-sm font-bold text-[#2F8B60]">
                        {points.balance.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#6BC4A0] font-medium hidden sm:inline">pts</span>
                </motion.div>

                {/* Notification Bell */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDrawerOpen(true)}
                    className="relative w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 border border-[#F0E4D8] text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors"
                >
                    <Bell size={18} />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FFA07A] border-2 border-white shadow-[0_0_0_2px_rgba(255,160,122,0.3)] animate-pulse" 
                            />
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* User Avatar + Dropdown */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 px-3 py-1.5 rounded-2xl cursor-pointer hover:bg-white/60 transition-colors"
                    >
                        <div
                            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: "linear-gradient(135deg, #6BC4A0, #2F8B60)" }}
                        >
                            {initial}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-[#2D2D2D] leading-tight">
                                {displayName.split(" ")[0]}
                            </p>
                            <p className="text-xs text-[#9C9C9C]">Premium</p>
                        </div>
                        <ChevronDown size={14} className={`text-[#9C9C9C] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </motion.button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_32px_rgba(45,45,45,0.12)] border border-[#F0E4D8] overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-[#F0E4D8]">
                                    <p className="text-sm font-bold text-[#2D2D2D] truncate">{displayName}</p>
                                    <p className="text-xs text-[#9C9C9C] truncate">{user?.email ?? ""}</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#FFA07A] hover:bg-[#FFF4EF] transition-colors rounded-full"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Absolute Notification Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-[#2D2D2D]/40 z-[90] cursor-pointer"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 w-full max-w-[380px] h-full bg-white shadow-2xl z-[100] flex flex-col border-l border-[#F0E4D8]"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#F0E4D8]">
                                <h3 className="font-serif text-2xl text-[#2D2D2D]">Notifications</h3>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs font-bold text-[#6BC4A0] hover:text-[#5BB48F] transition-colors rounded-full">
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full bg-[#FFF8F4] flex items-center justify-center text-[#9C9C9C] hover:text-[#2D2D2D] transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center mt-[-40px]">
                                        <div className="w-16 h-16 rounded-full bg-[#FFF8F4] flex items-center justify-center mb-4">
                                            <Bell size={24} className="text-[#D4C9BE]" />
                                        </div>
                                        <p className="text-sm font-bold text-[#6B6B6B]">All caught up</p>
                                        <p className="text-xs text-[#9C9C9C] mt-1">We'll alert you when there's an update.</p>
                                    </div>
                                ) : (
                                    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(n => {
                                        const isUnread = !n.isRead;
                                        
                                        let Icon = Bell;
                                        let iconColor = "text-[#6BC4A0]";
                                        let iconBg = "bg-[#E1F5EE]";
                                        
                                        if (n.type === 'streak') { Icon = Flame; iconColor = "text-[#FFA07A]"; iconBg = "bg-[#FFF0EA]"; }
                                        else if (n.type === 'planner') { Icon = CalIcon; iconColor = "text-[#F59E0B]"; iconBg = "bg-[#FAEEDA]"; }
                                        else if (n.type === 'points') { Icon = Trophy; iconColor = "text-[#F59E0B]"; iconBg = "bg-[#FAEEDA]"; }

                                        // Relative time formatting
                                        const msPast = Date.now() - new Date(n.createdAt).getTime();
                                        const hPast = Math.floor(msPast / (1000 * 60 * 60));
                                        const timeStr = hPast < 1 ? "Just now" : hPast < 24 ? `${hPast}h ago` : `${Math.floor(hPast/24)}d ago`;

                                        return (
                                            <div 
                                                key={n.id}
                                                onClick={() => {
                                                    markAsRead(n.id);
                                                    setDrawerOpen(false);
                                                    if (n.actionLink) router.push(n.actionLink);
                                                }}
                                                className={`p-4 rounded-2xl cursor-pointer transition-colors flex gap-4 ${isUnread ? 'bg-[#FFF8F4] border border-[#F0E4D8]' : 'bg-white hover:bg-[#F9F6F0]'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${iconBg}`}>
                                                    <Icon size={18} className={iconColor} />
                                                </div>
                                                <div className="flex-1 pt-0.5">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className={`text-sm ${isUnread ? 'font-black text-[#2D2D2D]' : 'font-bold text-[#6B6B6B]'}`}>{n.title}</h4>
                                                        {isUnread && <div className="w-2 h-2 rounded-full bg-[#FFA07A] flex-shrink-0 mt-1.5" />}
                                                    </div>
                                                    <p className={`text-xs leading-relaxed ${isUnread ? 'text-[#6B6B6B] font-semibold' : 'text-[#9C9C9C]'}`}>{n.message}</p>
                                                    <p className="text-[10px] font-bold text-[#D4C9BE] mt-2 capitalize tracking-wide">{timeStr}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}

