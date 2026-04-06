"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface MacroBlobProps {
    label: string;
    value: number;
    target: number;
    unit?: string;
    color: string;
    bgColor: string;
    size?: number;
    delay?: number;
}

function getMacroLabel(consumed: number, target: number, unit: string): { text: string; color: string } {
    const gap = target - consumed;
    const pct = consumed / target;
    if (pct >= 1.0) return { text: `+${Math.round(consumed - target)}${unit} over`, color: '#FFA07A' };
    if (pct >= 0.9) return { text: 'On track', color: '#6BC4A0' };
    if (pct >= 0.5) return { text: `${Math.round(gap)}${unit} to go`, color: '#F59E0B' };
    return { text: `${Math.round(gap)}${unit} remaining`, color: '#6B6B6B' };
}

export function MacroBlob({
    label,
    value,
    target,
    unit = "g",
    color,
    bgColor,
    size = 120,
    delay = 0,
}: MacroBlobProps) {
    const pct = Math.min(100, Math.round((value / target) * 100));
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    const labelData = getMacroLabel(value, target, unit);
    const [celebrate, setCelebrate] = useState(false);
    const celebratedRef = useRef<boolean>(false);

    useEffect(() => {
        if (value >= target && !celebratedRef.current) {
            celebratedRef.current = true;
            setCelebrate(true);
            const t = setTimeout(() => setCelebrate(false), 3000);
            return () => clearTimeout(t);
        }
    }, [value, target]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-3 p-5 rounded-[20px] relative"
            style={{
                background: bgColor,
                boxShadow: `0 8px 32px ${color}22`,
            }}
        >
            {/* SVG Ring with optional Pulse Celebration */}
            <motion.div 
                className="relative" 
                style={{ width: size, height: size }}
                animate={celebrate ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={celebrate ? { type: "spring", stiffness: 300, damping: 10 } : { duration: 0 }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    className="-rotate-90"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        opacity="0.6"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.8 }}
                        className="text-xl font-bold leading-none"
                        style={{ color }}
                    >
                        {pct}%
                    </motion.span>
                </div>
            </motion.div>

            {/* Gap Labels */}
            <div className="text-center relative">
                <p className="text-xs font-semibold capitalize tracking-wider text-[#9C9C9C]">
                    {label}
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: labelData.color }}>
                    {labelData.text}
                </p>
                
                {/* Optional Over Target Celebration Label Fade */}
                <AnimatePresence>
                    {celebrate && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute -bottom-6 w-full text-center"
                        >
                            <span className="text-[10px] font-bold text-[#6BC4A0] whitespace-nowrap bg-white/60 px-2 py-0.5 rounded-full shadow-sm">
                                ✓ Target hit!
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
