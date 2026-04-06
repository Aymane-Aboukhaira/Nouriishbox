"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Lock, ShieldCheck, RotateCcw, Clock,
    ChefHat, Truck, BarChart2, AlertCircle, Loader2,
    MapPin, CreditCard, ChevronRight, ShoppingBag,
    Users, Calendar, Utensils
} from "lucide-react";
import { useAuthStore, useSubscriptionStore, usePointsStore, useOnboardingStore, useMealsStore } from "@/lib/store";

// --- SCHEMA ---
const paymentSchema = z.object({
    fullName: z.string().min(2, "Full name required"),
    phone: z.string().min(10, "Valid phone required"),
    addressLine: z.string().min(5, "Delivery address required"),
    city: z.string().min(2, "City required"),
    cardName: z.string().min(2, "Name on card required"),
    cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Enter a valid 16-digit card number"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Enter valid expiry (MM/YY)"),
    cvv: z.string().regex(/^\d{3,4}$/, "Enter 3 or 4 digits"),
});
type PaymentForm = z.infer<typeof paymentSchema>;

function FieldError({ msg }: { msg: string }) {
    return (
        <motion.p
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-1.5 mt-2 text-[10px] text-accent font-bold uppercase tracking-wider"
        >
            <AlertCircle size={12} />
            {msg}
        </motion.p>
    );
}

function CheckoutContent() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { setSubscription } = useSubscriptionStore();
    const { addPoints } = usePointsStore();
    const { selections, clearSelections } = useOnboardingStore();
    const { meals } = useMealsStore();

    const [hasMounted, setHasMounted] = useState(false);
    const [method, setMethod] = useState<"card" | "paypal">("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Auth guard & Empty check
    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (hasMounted) {
            if (!isAuthenticated) {
                router.replace("/auth/signin?from=/checkout");
            } else if (selections.selectedMealIds.length === 0) {
                router.replace("/onboarding/pricing-setup");
            }
        }
    }, [hasMounted, isAuthenticated, router, selections.selectedMealIds.length]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PaymentForm>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            fullName: user?.name || "",
            addressLine: user?.address || "",
        },
        mode: "onSubmit",
    });

    // --- Dynamic Pricing Logic ---
    const discountPercent = useMemo(() => {
        const p = selections.peopleCount;
        if (p === 2) return 8;
        if (p === 3) return 12;
        if (p >= 4) return 15;
        return 0;
    }, [selections.peopleCount]);

    const selectedMealsData = useMemo(() => {
        return selections.selectedMealIds.map(id => {
            const meal = meals.find(m => m.id === id);
            return meal;
        }).filter(Boolean);
    }, [selections.selectedMealIds, meals]);

    const subtotal = useMemo(() => {
        return selectedMealsData.reduce((acc, m) => acc + (m?.price_mad || 0), 0);
    }, [selectedMealsData]);

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const firstOrderBonus = 50; // Special 50 MAD off first order incentive
    const totalToday = subtotal - discountAmount - firstOrderBonus;

    // Aggregate Macros
    const totalMacros = useMemo(() => {
        return selectedMealsData.reduce((acc, m) => ({
            kcal: acc.kcal + (m?.macros?.kcal || 0),
            protein: acc.protein + (m?.macros?.protein_g || 0),
            carbs: acc.carbs + (m?.macros?.carbs_g || 0),
            fats: acc.fats + (m?.macros?.fats_g || 0),
        }), { kcal: 0, protein: 0, carbs: 0, fats: 0 });
    }, [selectedMealsData]);

    if (!hasMounted || selections.selectedMealIds.length === 0) return null;

    // Handlers
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 16) val = val.slice(0, 16);
        const parts = val.match(/.{1,4}/g);
        setValue("cardNumber", parts ? parts.join(" ") : "", { shouldValidate: true });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
        setValue("expiry", val, { shouldValidate: true });
    };

    const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
        setValue("cvv", val, { shouldValidate: true });
    };

    const onSubmit = async (data: PaymentForm) => {
        if (method === "paypal") {
            setFormError("PayPal checkout is currently in maintenance. Please use a credit card.");
            return;
        }

        setFormError(null);
        setIsProcessing(true);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const orderId = `NB-${Date.now().toString().slice(-5)}`;
        
        setSubscription({
            status: "active",
            people_count: selections.peopleCount,
            days_per_week: selections.daysPerWeek,
            meals_per_day: selections.mealsPerDay,
            price_mad: totalToday,
            starts_at: new Date().toISOString(),
            renews_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        });

        addPoints(500); // 500 points for first order
        
        // Clear selections after successful checkout
        clearSelections();

        router.push(`/confirmation?orderId=${orderId}`);
    };

    return (
        <div className="min-h-screen bg-[#FDFCF9]">
            {/* Minimal High-End Header */}
            <header className="w-full h-24 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-serif text-3xl text-primary lowercase tracking-tight">nourishbox</span>
                </Link>
                <div className="flex items-center gap-3 text-primary/40">
                    <Lock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Checkout</span>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-12 items-start pb-32">
                
                {/* LEFT: Dynamic Order Summary */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[40px] p-8 lg:p-12 shadow-[0_30px_60px_-15px_rgba(44,62,45,0.06)] border-[1.5px] border-border"
                >
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
                        <h2 className="font-serif text-4xl text-text-primary italic">Your Personalized Week</h2>
                        <Link href="/onboarding/pricing-setup" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:tracking-[0.2em] transition-all">
                            Modify Setup
                        </Link>
                    </div>

                    {/* Breakdown Strip */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-background rounded-3xl p-4 flex flex-col items-center gap-1">
                            <Users size={16} className="text-primary/50" />
                            <span className="text-xs font-bold text-text-primary">{selections.peopleCount} {selections.peopleCount === 1 ? 'Person' : 'People'}</span>
                        </div>
                        <div className="bg-background rounded-3xl p-4 flex flex-col items-center gap-1">
                            <Calendar size={16} className="text-primary/50" />
                            <span className="text-xs font-bold text-text-primary">{selections.daysPerWeek} Days</span>
                        </div>
                        <div className="bg-background rounded-3xl p-4 flex flex-col items-center gap-1">
                            <Utensils size={16} className="text-primary/50" />
                            <span className="text-xs font-bold text-text-primary">{selections.mealsPerDay} {selections.mealsPerDay === 1 ? 'Meal' : 'Meals'} / Day</span>
                        </div>
                    </div>

                    {/* Itemized Meal List */}
                    <div className="space-y-6 mb-12">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mb-4">Itemized Menu</h3>
                        <div className="max-h-[400px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                            {selectedMealsData.map((meal: any, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background border border-border shrink-0 shadow-sm relative">
                                        <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-serif text-lg text-text-primary truncate">{meal.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{meal.macros?.kcal} kcal</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{meal.emoji} {meal.category}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-sans font-bold text-text-primary text-sm">{meal.price_mad} MAD</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-[#FAF9F6] rounded-3xl p-8 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted font-medium uppercase tracking-wider">Subtotal</span>
                            <span className="font-bold text-text-primary">{subtotal} MAD</span>
                        </div>
                        {discountPercent > 0 && (
                            <div className="flex justify-between items-center text-sm text-[#D48166]">
                                <span className="font-medium uppercase tracking-wider">Multi-Person Discount ({discountPercent}%)</span>
                                <span className="font-bold">-{discountAmount} MAD</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm text-primary">
                            <span className="font-medium uppercase tracking-wider">Early Adopter Bonus</span>
                            <span className="font-bold">-{firstOrderBonus} MAD</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-primary">
                            <span className="font-medium uppercase tracking-wider">Eco-Delivery</span>
                            <span className="font-bold tracking-widest">FREE</span>
                        </div>
                        
                        <div className="pt-6 mt-2 border-t border-border flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.3em] mb-1">Total Weekly Investment</span>
                                <span className="font-serif text-5xl text-text-primary leading-none">{totalToday} <span className="text-lg">MAD</span></span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-[#D48166] uppercase tracking-widest mb-1">Weekly Savings</span>
                                <span className="font-bold text-text-primary">{(discountAmount + firstOrderBonus)} MAD</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT: Payment & Security */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:sticky lg:top-12 space-y-8"
                >
                    <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-[0_30px_60px_-15px_rgba(44,62,45,0.06)] border-[1.5px] border-border">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                <h2 className="font-serif text-2xl text-text-primary italic">Checkout Details</h2>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <input
                                            {...register("fullName")}
                                            placeholder="Full Name"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                        />
                                        {errors.fullName && <FieldError msg={errors.fullName.message!} />}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <input
                                                {...register("phone")}
                                                placeholder="Phone"
                                                className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                            />
                                            {errors.phone && <FieldError msg={errors.phone.message!} />}
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                {...register("city")}
                                                placeholder="City"
                                                className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                            />
                                            {errors.city && <FieldError msg={errors.city.message!} />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            {...register("addressLine")}
                                            placeholder="Delivery Address"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                        />
                                        {errors.addressLine && <FieldError msg={errors.addressLine.message!} />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Card Details</h3>
                                <div className="space-y-4">
                                    <input
                                        {...register("cardName")}
                                        placeholder="Name on Card"
                                        className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none text-sm font-sans"
                                    />
                                    <input
                                        {...register("cardNumber")}
                                        onChange={handleCardNumberChange}
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none text-sm font-sans tracking-widest"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            {...register("expiry")}
                                            onChange={handleExpiryChange}
                                            placeholder="MM/YY"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none text-sm font-sans"
                                        />
                                        <input
                                            {...register("cvv")}
                                            onChange={handleCVVChange}
                                            type="password"
                                            placeholder="CVV"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background outline-none text-sm font-sans"
                                        />
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-[9px] font-bold uppercase tracking-widest text-center">
                                    {formError}
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={isProcessing}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-16 bg-primary text-background rounded-full font-serif text-xl shadow-xl flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : (
                                    <>
                                        <span>Confirm Order</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    <div className="flex flex-col items-center gap-6 opacity-40">
                        <div className="flex items-center gap-8">
                            <ShieldCheck size={20} />
                            <Clock size={20} />
                            <RotateCcw size={20} />
                        </div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-center">
                            Secure 256-bit SSL • PCI Compliant • Cancel Anytime
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
