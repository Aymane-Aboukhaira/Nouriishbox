"use client";
import { Header } from "@/components/layout/header";
import { useAnalyticsStore } from "@/lib/store";
import { MOCK_USER } from "@/lib/mock-data";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Target, Award, Flame } from "lucide-react";

function HeatmapCell({ adherence, date }: { adherence: number; date: string }) {
    const getColor = (v: number) => {
        if (v >= 90) return "#2F8B60";
        if (v >= 75) return "#6BC4A0";
        if (v >= 60) return "#A8E6CF";
        if (v >= 40) return "#FFD3B6";
        return "#FFE5A0";
    };
    return (
        <motion.div
            whileHover={{ scale: 1.2, zIndex: 10 }}
            className="relative heatmap-cell cursor-pointer"
            style={{
                width: 28,
                height: 28,
                background: getColor(adherence),
                borderRadius: 6,
            }}
            title={`${date}: ${adherence}% adhérence`}
        />
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-2xl p-3 border border-[#F0E4D8]"
                style={{ boxShadow: "0 8px 32px rgba(45,45,45,0.12)" }}>
                <p className="text-xs font-bold text-[#2D2D2D] mb-2">{label}</p>
                {payload.map((item: any) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-[#6B6B6B]">{item.name}:</span>
                        <span className="font-semibold text-[#2D2D2D]">{item.value}{item.name === "kcal" ? "" : "g"}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const { logs } = useAnalyticsStore();

    // Only last 14 days for chart readability
    const chartData = logs.slice(-14).map((log) => ({
        date: new Date(log.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        Protéines: log.consumed.protein_g,
        Glucides: log.consumed.carbs_g,
        Lipides: log.consumed.fats_g,
        Calories: log.consumed.kcal,
        adherence: log.adherence,
    }));

    const avgAdherence = Math.round(logs.reduce((s, l) => s + l.adherence, 0) / logs.length);
    const bestStreak = 12;
    const totalMeals = logs.length * 3;
    const avgKcal = Math.round(logs.reduce((s, l) => s + l.consumed.kcal, 0) / logs.length);

    const statCards = [
        { label: "Adhérence moyenne", value: `${avgAdherence}%`, icon: Target, color: "#6BC4A0", bg: "#F1FAF4" },
        { label: "Meilleure série", value: `${bestStreak} jours`, icon: Award, color: "#B09AE0", bg: "#F0EAFF" },
        { label: "Total repas", value: totalMeals, icon: Flame, color: "#FFA07A", bg: "#FFF0E8" },
        { label: "Moy. Calories/j", value: `${avgKcal} kcal`, icon: TrendingUp, color: "#F59E0B", bg: "#FFFBEA" },
    ];

    return (
        <div className="min-h-screen">
            <Header title="Analytics & Nutrition" subtitle="30 derniers jours · Objectif: Prise de Masse" />
            <div className="p-8 space-y-8">
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="p-5 rounded-[20px]"
                                style={{ background: card.bg, border: `1px solid ${card.color}33` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-[#9C9C9C] capitalize tracking-wide">{card.label}</p>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: card.color + "22" }}>
                                        <Icon size={16} style={{ color: card.color }} />
                                    </div>
                                </div>
                                <p className="font-serif text-2xl" style={{ color: card.color }}>{card.value}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main charts row */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Macro Trend Line Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-[20px] bg-white"
                        style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                    >
                        <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">Tendance Macros</h2>
                        <p className="text-xs text-[#9C9C9C] mb-5">14 derniers jours (en grammes)</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                <Line type="monotone" dataKey="Protéines" stroke="#B09AE0" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#B09AE0" }} />
                                <Line type="monotone" dataKey="Glucides" stroke="#6BC4A0" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#6BC4A0" }} />
                                <Line type="monotone" dataKey="Lipides" stroke="#FFA07A" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#FFA07A" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Calorie Area Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-[20px] bg-white"
                        style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                    >
                        <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">Calories Consommées</h2>
                        <p className="text-xs text-[#9C9C9C] mb-5">Objectif: {MOCK_USER.daily_targets.kcal} kcal/jour</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="kcalGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFA07A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FFA07A" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6BC4A0" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6BC4A0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} domain={[800, 2600]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Calories" stroke="#FFA07A" strokeWidth={2.5} fill="url(#kcalGrad)" dot={false} activeDot={{ r: 5, fill: "#FFA07A" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Goal Adherence Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-[20px] bg-white"
                    style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-serif text-lg text-[#2D2D2D]">Heatmap d'Adhérence</h2>
                            <p className="text-xs text-[#9C9C9C] mt-0.5">30 derniers jours — conformité à vos objectifs nutritionnels</p>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-2 text-[10px] text-[#9C9C9C]">
                            <span>Faible</span>
                            {["#FFE5A0", "#FFD3B6", "#A8E6CF", "#6BC4A0", "#2F8B60"].map((c) => (
                                <div key={c} className="w-4 h-4 rounded" style={{ background: c }} />
                            ))}
                            <span>Excellent</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {logs.map((log, idx) => (
                            <motion.div
                                key={log.date}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + idx * 0.015 }}
                            >
                                <HeatmapCell adherence={log.adherence} date={log.date} />
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-5 flex-wrap">
                        {[
                            { range: "≥90%", label: "Excellent", color: "#2F8B60" },
                            { range: "75-89%", label: "Très bien", color: "#6BC4A0" },
                            { range: "60-74%", label: "Bien", color: "#A8E6CF" },
                            { range: "40-59%", label: "Passable", color: "#FFD3B6" },
                            { range: "<40%", label: "À améliorer", color: "#FFE5A0" },
                        ].map((item) => (
                            <div key={item.range} className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
                                <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                                <span>{item.label} ({item.range})</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
