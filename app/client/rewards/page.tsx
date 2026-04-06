"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Gift, ArrowRight, Copy, Check, MessageCircle, PlusCircle, CheckCircle2, History } from "lucide-react";
import { usePointsStore, useProfileStore, useNotificationStore } from "@/lib/store";
import { toast } from "sonner";

export default function RewardsPage() {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    if (!hasMounted) return null;

    return (
        <div className="max-w-3xl mx-auto w-full pt-8 px-6 md:px-8 pb-32">
            <h1 className="font-serif text-4xl text-[#2D2D2D] mb-8">Rewards hub</h1>
            
            <div className="space-y-8">
                <BalanceCard />
                <RedemptionSection />
                <ReferralEngine />
                <PointsHistory />
            </div>

            {/* Confetti Styles */}
            <style jsx global>{`
                .confetti-container { position: fixed; inset: 0; pointer-events: none; z-index: 100; overflow: hidden; }
                .confetti { position: absolute; top: -10px; width: 10px; height: 10px; background: #6BC4A0; opacity: 0; }
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

function BalanceCard() {
    const { points } = usePointsStore();
    const balance = points.balance;
    const progress = Math.min((balance / 500) * 100, 100);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] bg-gradient-to-br from-[#FFF8F4] to-[#FDF4E1] border border-[#F0E4D8]"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy size={18} className="text-[#F59E0B]" />
                        <span className="text-sm font-bold text-[#6B6B6B] capitalize tracking-wider">Your Balance</span>
                    </div>
                    <h2 className="font-serif text-5xl md:text-6xl text-[#2D2D2D]">
                        {balance.toLocaleString()}
                    </h2>
                    <p className="text-sm font-semibold text-[#F59E0B] mt-1">NourishPoints</p>
                </div>

                <div className="w-full md:w-[300px] bg-white p-5 rounded-2xl border border-[#F0E4D8]">
                    <div className="flex justify-between text-xs font-bold text-[#6B6B6B] mb-2">
                        <span>{balance}</span>
                        <span>500</span>
                    </div>
                    <div className="w-full h-3 bg-[#FFF8F4] rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#F59E0B] rounded-full"
                        />
                    </div>
                    <p className="text-[11px] font-bold text-[#9C9C9C] mt-3 text-center">
                        {balance >= 500 ? "You have enough for an upgrade!" : `${500 - balance} pts to your next free premium upgrade`}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function RedemptionSection() {
    const { points, addPoints } = usePointsStore();
    const [isBursting, setIsBursting] = useState(false);

    const handleRedeem = () => {
        if (points.balance < 500) return;
        addPoints(-500, "Redeemed premium upgrade");
        setIsBursting(true);
        toast.success("Upgrade unlocked! Apply it in your planner.");
        setTimeout(() => setIsBursting(false), 3000);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">Redeem points</h3>
            
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#F0E4D8] flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF8F4] flex items-center justify-center flex-shrink-0">
                    <Gift size={28} className="text-[#6BC4A0]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-[#2D2D2D] text-lg">Free Premium Meal Upgrade</h4>
                    <p className="text-sm text-[#9C9C9C] mt-1">Swap any standard meal for a chef-specialty cut (salmon, steak, etc.) this week.</p>
                </div>
                <button 
                    onClick={handleRedeem}
                    disabled={points.balance < 500}
                    className="w-full md:w-auto px-6 py-3 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
                    style={{ background: points.balance >= 500 ? "linear-gradient(135deg, #6BC4A0, #2F8B60)" : "#D4C9BE" }}
                >
                    Redeem 500 pts
                </button>
            </div>

            {isBursting && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div 
                            key={i} 
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animation: `fall ${Math.random() * 2 + 1}s ease-in forwards`,
                                backgroundColor: ['#6BC4A0', '#F59E0B', '#B09AE0', '#FFA07A'][Math.floor(Math.random()*4)]
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function ReferralEngine() {
    const { profile } = useProfileStore();
    const { addPoints } = usePointsStore();
    const { addNotification } = useNotificationStore();
    const [copied, setCopied] = useState(false);
    
    // Generate deterministic code based on name to avoid hydration mismatch jumping
    const refCode = useMemo(() => {
        const prefix = (profile.name || "MEMBER").substring(0,5).toUpperCase().replace(/[^A-Z]/g, 'X');
        return `NB-${prefix}-9X2A`;
    }, [profile.name]);

    const handleCopy = () => {
        navigator.clipboard.writeText(refCode);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Here's 50 MAD off your first Nourishbox! Use my code ${refCode} at checkout. https://nourishbox.ma`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleSimulate = () => {
        addPoints(500, "Referral success: Friend joined");
        addNotification({
            type: 'points',
            title: "Referral successful!",
            message: "A friend joined using your code. +500 pts added.",
        });
        toast.success("Simulation: +500 pts applied");
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#FFF8F4] rounded-[20px] p-6 md:p-8 border-2 border-dashed border-[#A8E6CF]">
                <h3 className="font-serif text-2xl text-[#2F8B60] mb-2">Invite a friend, get rewarded.</h3>
                <p className="text-sm font-semibold text-[#6BC4A0] mb-6">Give them 50 MAD off their first box, get 500 NourishPoints (free upgrade) when they order.</p>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-auto flex-1 bg-white border border-[#A8E6CF] px-5 py-3 rounded-2xl flex items-center justify-center">
                        <span className="font-mono text-xl font-black text-[#2D2D2D] tracking-widest">{refCode}</span>
                    </div>
                    <div className="w-full md:w-auto flex gap-2">
                        <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#D4C9BE] text-[#2D2D2D] font-bold text-sm hover:bg-[#F9F6F0] transition-colors">
                            {copied ? <Check size={18} className="text-[#6BC4A0]" /> : <Copy size={18} />} 
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <button onClick={handleWhatsApp} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-bold text-sm hover:bg-[#20BE5C] transition-colors shadow-md">
                            <MessageCircle size={18} /> WhatsApp
                        </button>
                    </div>
                </div>

                <div className="mt-6 border-t border-[#A8E6CF]/30 pt-4 text-center">
                    <button onClick={handleSimulate} className="text-[10px] font-bold text-[#A8E6CF] hover:text-[#2F8B60] transition-colors capitalize tracking-wider rounded-full">
                        [Dev] Simulate referral success
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function PointsHistory() {
    const { history } = usePointsStore();

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">History</h3>
            
            <div className="bg-white rounded-[20px] shadow-sm border border-[#F0E4D8] overflow-hidden p-2">
                {history.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#FFF8F4] rounded-full flex items-center justify-center mb-3">
                            <History className="text-[#D4C9BE]" />
                        </div>
                        <p className="font-bold text-[#2D2D2D]">No points earned yet</p>
                        <p className="text-sm text-[#9C9C9C] mt-1">Start planning and eating to earn points.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {history.map((tx) => {
                            const isPositive = tx.amount > 0;
                            return (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#FFF8F4] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPositive ? 'bg-[#E1F5EE] text-[#6BC4A0]' : 'bg-[#FFF0EA] text-[#FFA07A]'}`}>
                                            {isPositive ? <PlusCircle size={18} /> : <Gift size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#2D2D2D] text-sm">{tx.reason}</p>
                                            <p className="text-xs text-[#9C9C9C]">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(tx.date))}</p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-black ${isPositive ? 'text-[#F59E0B]' : 'text-[#2D2D2D]'}`}>
                                        {isPositive ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
