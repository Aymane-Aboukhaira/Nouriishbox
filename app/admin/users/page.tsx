"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAdminUsersStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pause, Play, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Actif", color: "#6BC4A0", bg: "#F1FAF4" },
    paused: { label: "Pausé", color: "#F59E0B", bg: "#FFFBEA" },
    cancelled: { label: "Annulé", color: "#FFA07A", bg: "#FFF0E8" },
};

export default function AdminUsersPage() {
    const { users, updateUserStatus } = useAdminUsersStore();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filtered = users.filter((u) => {
        const matchSearch =
            search === "" ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || u.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="min-h-screen">
            <Header title="Gestion Utilisateurs" subtitle={`${users.filter((u) => u.status === "active").length} abonnés actifs`} />
            <div className="p-8">
                {/* Toolbar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", "active", "paused", "cancelled"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                                style={
                                    filterStatus === status
                                        ? { background: "#6BC4A0", color: "white" }
                                        : { background: "white", color: "#6B6B6B", border: "1px solid #F0E4D8" }
                                }
                            >
                                {status === "all" ? "Tous" : STATUS_CONFIG[status]?.label ?? status}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto text-sm font-medium text-[#9C9C9C]">
                        {filtered.length} résultats
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        {
                            label: "Actifs",
                            count: users.filter((u) => u.status === "active").length,
                            color: "#6BC4A0",
                            bg: "#F1FAF4",
                        },
                        {
                            label: "Pausés",
                            count: users.filter((u) => u.status === "paused").length,
                            color: "#F59E0B",
                            bg: "#FFFBEA",
                        },
                        {
                            label: "Annulés",
                            count: users.filter((u) => u.status === "cancelled").length,
                            color: "#FFA07A",
                            bg: "#FFF0E8",
                        },
                    ].map((item) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 rounded-2xl"
                            style={{ background: item.bg, border: `1px solid ${item.color}33` }}
                        >
                            <span className="font-serif text-3xl" style={{ color: item.color }}>{item.count}</span>
                            <span className="text-sm text-[#6B6B6B] font-medium">{item.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* User table */}
                <div className="bg-white rounded-[20px] overflow-hidden"
                    style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}>
                    <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#FFF8F4] border-b border-[#F0E4D8]">
                        {["Utilisateur", "Email", "Configuration", "Commandes", "Statut", "Actions"].map((h) => (
                            <span key={h} className="text-[11px] font-bold capitalize tracking-wide text-[#9C9C9C]">{h}</span>
                        ))}
                    </div>
                    <AnimatePresence>
                        {filtered.map((user, idx) => {
                            const statusConfig = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active;
                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-[#FFF8F4] transition-colors border-b border-[#F0E4D8] last:border-0"
                                >
                                    {/* User */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, #6BC4A0, #2F8B60)" }}
                                        >
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#2D2D2D]">{user.name}</p>
                                            <p className="text-[11px] text-[#9C9C9C]">Depuis {new Date(user.since).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</p>
                                        </div>
                                    </div>
                                    {/* Email */}
                                    <p className="text-sm text-[#6B6B6B] truncate">{user.email}</p>
                                    {/* Setup */}
                                    <span className="text-[11px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full w-fit">
                                        {(user as any).setup}
                                    </span>
                                    {/* Orders */}
                                    <p className="text-sm font-semibold text-[#2D2D2D]">{user.total_orders}</p>
                                    {/* Status */}
                                    <span
                                        className="px-2.5 py-1 rounded-full text-[11px] font-bold w-fit flex items-center gap-1"
                                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.color }} />
                                        {statusConfig.label}
                                    </span>
                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5">
                                        {user.status === "active" && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => {
                                                    updateUserStatus(user.id, "paused");
                                                    toast.info(`Abonnement de ${user.name} mis en pause`);
                                                }}
                                                title="Mettre en pause"
                                                className="w-8 h-8 rounded-xl bg-[#FFFBEA] text-[#F59E0B] flex items-center justify-center hover:bg-[#FFE5A0] transition-colors"
                                            >
                                                <Pause size={13} />
                                            </motion.button>
                                        )}
                                        {user.status === "paused" && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => {
                                                    updateUserStatus(user.id, "active");
                                                    toast.success(`Abonnement de ${user.name} repris ✅`);
                                                }}
                                                title="Reprendre"
                                                className="w-8 h-8 rounded-xl bg-[#F1FAF4] text-[#6BC4A0] flex items-center justify-center hover:bg-[#A8E6CF]/30 transition-colors"
                                            >
                                                <Play size={13} />
                                            </motion.button>
                                        )}
                                        {user.status !== "cancelled" && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => {
                                                    updateUserStatus(user.id, "cancelled");
                                                    toast.error(`Abonnement de ${user.name} annulé`);
                                                }}
                                                title="Annuler l'abonnement"
                                                className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                                            >
                                                <XCircle size={13} />
                                            </motion.button>
                                        )}
                                        {user.status === "cancelled" && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => {
                                                    updateUserStatus(user.id, "active");
                                                    toast.success(`Abonnement de ${user.name} réactivé ✅`);
                                                }}
                                                title="Réactiver"
                                                className="w-8 h-8 rounded-xl bg-[#F1FAF4] text-[#6BC4A0] flex items-center justify-center hover:bg-[#A8E6CF]/30 transition-colors"
                                            >
                                                <CheckCircle size={13} />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
