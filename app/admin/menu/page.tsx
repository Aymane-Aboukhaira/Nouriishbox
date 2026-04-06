"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useMealsStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Meal, MealCategory, MealTier } from "@/lib/types";

const mealSchema = z.object({
    name: z.string().min(3, "Nom trop court"),
    description: z.string().min(10, "Description trop courte"),
    category: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    emoji: z.string().min(1, "Choisissez un emoji"),
    kcal: z.coerce.number().min(50).max(2000),
    protein_g: z.coerce.number().min(0).max(200),
    carbs_g: z.coerce.number().min(0).max(400),
    fats_g: z.coerce.number().min(0).max(200),
    price_mad: z.coerce.number().min(10).max(500),
    tier: z.enum(["budget", "standard", "premium", "kids"]),
    prep_time_min: z.coerce.number().min(1).max(180),
    is_vegan: z.boolean(),
    is_gluten_free: z.boolean(),
});
type MealForm = z.infer<typeof mealSchema>;

const CATEGORY_LABELS: Record<MealCategory, string> = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation",
};

const TIER_LABELS: Record<MealTier, string> = {
    budget: "💚 Budget (35–50 MAD)",
    standard: "⭐ Standard (55–75 MAD)",
    premium: "👑 Premium (80–110 MAD)",
    kids: "🧒 Kids (28–42 MAD)",
};

/** Auto-derive tier based on price as a convenience helper */
function tierFromPrice(price: number): MealTier {
    if (price <= 50) return price <= 42 ? "kids" : "budget";
    if (price <= 75) return "standard";
    return "premium";
}

const CATEGORY_COLORS: Record<MealCategory, string> = {
    breakfast: "#FFE5A0",
    lunch: "#A8E6CF",
    dinner: "#D6C1FF",
    snack: "#FFD3B6",
};

const EMOJI_OPTIONS = ["🥗", "🫙", "🍲", "🍳", "🐟", "🫐", "🌯", "⚡", "🍛", "🥭", "🥙", "🍫", "🫕", "🍯", "🥩", "🥑", "🌮", "🍜", "🥘", "🫔"];

export default function AdminMenuPage() {
    const { meals, addMeal, updateMeal, deleteMeal, toggleMealActive } = useMealsStore();
    const [showModal, setShowModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [selectedEmoji, setSelectedEmoji] = useState("🥗");
    const [search, setSearch] = useState("");

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MealForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(mealSchema) as any,
        defaultValues: { category: "lunch", tier: "standard", is_vegan: false, is_gluten_free: false, emoji: "🥗" },
    });

    const openAdd = () => {
        setEditingMeal(null);
        setSelectedEmoji("🥗");
        reset({ category: "lunch", emoji: "🥗", is_vegan: false, is_gluten_free: false });
        setShowModal(true);
    };

    const openEdit = (meal: Meal) => {
        setEditingMeal(meal);
        setSelectedEmoji(meal.emoji);
        reset({
            name: meal.name,
            description: meal.description,
            category: meal.category,
            emoji: meal.emoji,
            kcal: meal.macros.kcal,
            protein_g: meal.macros.protein_g,
            carbs_g: meal.macros.carbs_g,
            fats_g: meal.macros.fats_g,
            price_mad: meal.price_mad,
            tier: meal.tier,
            prep_time_min: meal.prep_time_min,
            is_vegan: meal.is_vegan,
            is_gluten_free: meal.is_gluten_free,
        });
        setShowModal(true);
    };

    const onSubmit = (data: MealForm) => {
        const mealData = {
            name: data.name,
            description: data.description,
            category: data.category,
            emoji: selectedEmoji,
            image_url: "",
            slug: data.name.toLowerCase().replace(/\s+/g, "-"),
            macros: { kcal: data.kcal, protein_g: data.protein_g, carbs_g: data.carbs_g, fats_g: data.fats_g },
            price_mad: data.price_mad,
            tier: data.tier as MealTier,
            prep_time_min: data.prep_time_min,
            is_vegan: data.is_vegan,
            is_halal: true,
            is_gluten_free: data.is_gluten_free,
            allergens: [],
            tags: [],
            is_active: true,
        };

        if (editingMeal) {
            updateMeal(editingMeal.id, mealData);
            toast.success(`${data.name} mis à jour ! ✅`);
        } else {
            addMeal(mealData);
            toast.success(`${selectedEmoji} ${data.name} ajouté au menu ! 🎉`);
        }
        setShowModal(false);
        reset();
    };

    const filtered = meals.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <Header title="Menu Builder" subtitle="Gérez le catalogue de repas" />
            <div className="p-8">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <input
                        type="text"
                        placeholder="Rechercher un repas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2.5 rounded-2xl bg-white border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF] w-72"
                    />
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={openAdd}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-semibold"
                        style={{ background: "linear-gradient(135deg, #6BC4A0, #2F8B60)", boxShadow: "0 4px 16px rgba(107,196,160,0.3)" }}
                    >
                        <Plus size={16} />
                        Nouveau repas
                    </motion.button>
                </div>

                {/* Meals table */}
                <div className="bg-white rounded-[20px] overflow-hidden"
                    style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}>
                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#FFF8F4] border-b border-[#F0E4D8]">
                        {["Repas", "Catégorie", "Kcal · Prot", "Prix", "Statut", "Actions"].map((h) => (
                            <span key={h} className="text-[11px] font-bold capitalize tracking-wide text-[#9C9C9C]">{h}</span>
                        ))}
                    </div>
                    <div className="divide-y divide-[#F0E4D8]">
                        <AnimatePresence>
                            {filtered.map((meal, idx) => (
                                <motion.div
                                    key={meal.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-[#FFF8F4] transition-colors"
                                >
                                    {/* Name */}
                                    <div className="flex items-center gap-3">
                                        {meal.image_url ? (
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#F0E4D8] flex-shrink-0">
                                                <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-[#2D2D2D]">{meal.name}</p>
                                            <p className="text-[11px] text-[#9C9C9C] truncate max-w-[200px]">{meal.description.substring(0, 50)}...</p>
                                        </div>
                                    </div>
                                    {/* Category */}
                                    <span
                                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit"
                                        style={{ background: CATEGORY_COLORS[meal.category], color: "#2D2D2D" }}
                                    >
                                        {CATEGORY_LABELS[meal.category]}
                                    </span>
                                    {/* Macros */}
                                    <div>
                                        <p className="text-sm font-semibold text-[#2D2D2D]">{meal.macros.kcal} kcal</p>
                                        <p className="text-[11px] text-[#9C9C9C]">{meal.macros.protein_g}g protéines</p>
                                    </div>
                                    {/* Price */}
                                    <p className="text-sm font-bold text-[#2F8B60]">{meal.price_mad} MAD</p>
                                    {/* Status */}
                                    <button onClick={() => {
                                        toggleMealActive(meal.id);
                                        toast.info(`${meal.name} ${meal.is_active ? "désactivé" : "activé"}`);
                                    }}>
                                        {meal.is_active
                                            ? <ToggleRight size={26} className="text-[#6BC4A0]" />
                                            : <ToggleLeft size={26} className="text-[#C4C4C4]" />}
                                    </button>
                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => openEdit(meal)}
                                            className="w-8 h-8 rounded-xl bg-[#F1FAF4] text-[#6BC4A0] flex items-center justify-center hover:bg-[#A8E6CF]/30 transition-colors"
                                        >
                                            <Edit2 size={13} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => {
                                                deleteMeal(meal.id);
                                                toast.success(`${meal.name} supprimé`);
                                            }}
                                            className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={13} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <div className="px-6 py-3 bg-[#FFF8F4] border-t border-[#F0E4D8]">
                        <p className="text-xs text-[#9C9C9C]">{filtered.length} repas affichés</p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[20px] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            style={{ boxShadow: "0 24px 64px rgba(45,45,45,0.16)" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-xl text-[#2D2D2D]">
                                    {editingMeal ? "Modifier le repas" : "Nouveau repas"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-[#F1FAF4] text-[#9C9C9C] flex items-center justify-center">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Emoji picker */}
                            <div className="mb-5">
                                <label className="text-xs font-bold text-[#9C9C9C] capitalize tracking-wide mb-2 block">Emoji</label>
                                <div className="flex gap-2 flex-wrap">
                                    {EMOJI_OPTIONS.map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => { setSelectedEmoji(e); setValue("emoji", e); }}
                                            className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                                            style={{
                                                background: selectedEmoji === e ? "#A8E6CF" : "#FFF8F4",
                                                border: selectedEmoji === e ? "2px solid #6BC4A0" : "2px solid transparent",
                                                transform: selectedEmoji === e ? "scale(1.15)" : "scale(1)",
                                            }}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Nom du repas *</label>
                                        <input {...register("name")} placeholder="Ex: Bol Quinoa Poulet" className="w-full px-4 py-3 rounded-full bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]" />
                                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Description *</label>
                                        <textarea {...register("description")} rows={2} placeholder="Description du repas..." className="w-full px-4 py-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF] resize-none" />
                                        {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Catégorie</label>
                                        <select {...register("category")} className="w-full px-4 py-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]">
                                            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Prix (MAD) *</label>
                                        <input type="number" {...register("price_mad")} placeholder="78" className="w-full px-4 py-3 rounded-full bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Gamme (Tier)</label>
                                        <select {...register("tier")} className="w-full px-4 py-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]">
                                            {(Object.keys(TIER_LABELS) as MealTier[]).map((t) => (
                                                <option key={t} value={t}>{TIER_LABELS[t]}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Macros grid */}
                                <div>
                                    <label className="text-xs font-bold text-[#9C9C9C] capitalize tracking-wide mb-3 block">Valeurs Nutritionnelles</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { field: "kcal", label: "Calories", placeholder: "520", unit: "kcal" },
                                            { field: "protein_g", label: "Protéines", placeholder: "42", unit: "g" },
                                            { field: "carbs_g", label: "Glucides", placeholder: "48", unit: "g" },
                                            { field: "fats_g", label: "Lipides", placeholder: "14", unit: "g" },
                                        ].map(({ field, label, placeholder, unit }) => (
                                            <div key={field}>
                                                <label className="text-[11px] text-[#9C9C9C] mb-1 block">{label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        {...register(field as keyof MealForm)}
                                                        placeholder={placeholder}
                                                        className="w-full pl-3 pr-8 py-2.5 rounded-full bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9C9C9C]">{unit}</span>
                                                </div>
                                                {errors[field as keyof MealForm] && (
                                                    <p className="text-[10px] text-red-400 mt-0.5">{errors[field as keyof MealForm]?.message}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Prep time + flags */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Temps de préparation</label>
                                        <div className="relative">
                                            <input type="number" {...register("prep_time_min")} placeholder="25" className="w-full pl-3 pr-10 py-3 rounded-full bg-[#FFF8F4] border border-[#F0E4D8] text-sm outline-none focus:border-[#A8E6CF]" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9C9C9C]">min</span>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F1FAF4] border border-[#A8E6CF] cursor-pointer">
                                        <input type="checkbox" {...register("is_vegan")} className="w-4 h-4 accent-[#6BC4A0] rounded-full" />
                                        <span className="text-sm font-medium text-[#2F8B60]">🌱 Vegan</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] cursor-pointer">
                                        <input type="checkbox" {...register("is_gluten_free")} className="w-4 h-4 accent-[#6BC4A0] rounded-full" />
                                        <span className="text-sm font-medium text-[#2D2D2D]">🌾 Sans Gluten</span>
                                    </label>
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm mt-2"
                                    style={{ background: "linear-gradient(135deg, #6BC4A0, #2F8B60)", boxShadow: "0 4px 16px rgba(107,196,160,0.3)" }}
                                >
                                    {editingMeal ? "Mettre à jour le repas ✅" : "Ajouter au menu 🎉"}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
