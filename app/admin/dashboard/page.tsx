"use client";
import { Header } from "@/components/layout/header";
import { MOCK_ADMIN_METRICS } from "@/lib/mock-data";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Users, Truck, AlertCircle, ArrowUpRight } from "lucide-react";
import { formatMAD } from "@/lib/utils";

const metrics = MOCK_ADMIN_METRICS;

const kpiCards = [
    {
        label: "Revenu Mensuel (MRR)",
        value: formatMAD(metrics.mrr_mad),
        delta: "+12.4%",
        up: true,
        icon: TrendingUp,
        color: "#6BC4A0",
        bg: "#F1FAF4",
    },
    {
        label: "Abonnés Actifs",
        value: metrics.active_subscribers.toString(),
        delta: `+${metrics.new_this_week} cette semaine`,
        up: true,
        icon: Users,
        color: "#B09AE0",
        bg: "#F0EAFF",
    },
    {
        label: "Taux de Livraison",
        value: `${metrics.delivery_success_rate}%`,
        delta: "Objectif: 98%",
        up: true,
        icon: Truck,
        color: "#FFA07A",
        bg: "#FFF0E8",
    },
    {
        label: "Taux de Churn",
        value: `${metrics.churn_rate}%`,
        delta: "-0.4% vs mois dernier",
        up: false,
        icon: AlertCircle,
        color: "#F59E0B",
        bg: "#FFFBEA",
    },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white rounded-2xl p-3 border border-[#F0E4D8]"
                style={{ boxShadow: "0 8px 32px rgba(45,45,45,0.12)" }}>
                <p className="text-xs font-bold mb-1">{label}</p>
                <p className="text-sm font-semibold text-[#6BC4A0]">{formatMAD(payload[0]?.value)}</p>
            </div>
        );
    }
    return null;
};

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen">
            <Header title="Admin — Vue d'ensemble" subtitle="Tableau de bord opérationnel · Mars 2025" />
            <div className="p-8 space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-5">
                    {kpiCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="p-6 rounded-[20px]"
                                style={{ background: card.bg, border: `1px solid ${card.color}33` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-semibold text-[#9C9C9C] capitalize tracking-wide">{card.label}</p>
                                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                                        style={{ background: card.color + "22" }}>
                                        <Icon size={18} style={{ color: card.color }} />
                                    </div>
                                </div>
                                <p className="font-serif text-2xl text-[#2D2D2D] mb-1">{card.value}</p>
                                <div className="flex items-center gap-1.5">
                                    <ArrowUpRight
                                        size={12}
                                        style={{ color: card.up ? "#6BC4A0" : "#FFA07A", transform: card.up ? "none" : "rotate(180deg)" }}
                                    />
                                    <span className="text-xs font-medium" style={{ color: card.up ? "#6BC4A0" : "#FFA07A" }}>
                                        {card.delta}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Weekly Revenue Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="col-span-2 p-6 rounded-[20px] bg-white"
                        style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                    >
                        <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">Revenus Hebdomadaires</h2>
                        <p className="text-xs text-[#9C9C9C] mb-5">8 dernières semaines (en MAD)</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={metrics.weekly_revenue} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F1FAF4", radius: 8 }} />
                                <Bar dataKey="revenue" fill="url(#revGrad)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6BC4A0" />
                                        <stop offset="100%" stopColor="#A8E6CF" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Top Meals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="p-6 rounded-[20px] bg-white"
                        style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                    >
                        <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">Top Repas</h2>
                        <p className="text-xs text-[#9C9C9C] mb-5">Par nombre de commandes</p>
                        <div className="space-y-4">
                            {metrics.top_meals.map((meal, idx) => {
                                const maxOrders = metrics.top_meals[0].orders;
                                const pct = (meal.orders / maxOrders) * 100;
                                const colors = ["#6BC4A0", "#B09AE0", "#FFA07A", "#F59E0B", "#A8E6CF"];
                                return (
                                    <div key={meal.meal_id}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-medium text-[#2D2D2D] truncate pr-2">{meal.name}</span>
                                            <span className="text-xs font-bold text-[#6B6B6B] flex-shrink-0">{meal.orders}</span>
                                        </div>
                                        <div className="h-2 bg-[#F0E4D8] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                                                className="h-full rounded-full"
                                                style={{ background: colors[idx] }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Quick stats footer */}
                <div className="grid grid-cols-3 gap-5">
                    {[
                        { label: "Nouveaux abonnés ce mois", value: "47", icon: "👤" },
                        { label: "Commandes cette semaine", value: "1,842", icon: "📦" },
                        { label: "Rating moyen livraison", value: "4.7 / 5", icon: "⭐" },
                    ].map((item, idx) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + idx * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white"
                            style={{ border: "1px solid #F0E4D8" }}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                                <p className="text-xs text-[#9C9C9C]">{item.label}</p>
                                <p className="font-serif text-xl text-[#2D2D2D]">{item.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
