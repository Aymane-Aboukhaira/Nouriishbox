"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Lock, ShieldCheck, RotateCcw, Clock,
    ChefHat, Truck, BarChart2, AlertCircle, Loader2,
    MapPin, CreditCard, ChevronRight, ShoppingBag
} from "lucide-react";
import { useAuthStore, useSubscriptionStore, usePointsStore, usePlannerStore, useMealsStore } from "@/lib/store";
import type { SubscriptionPlan } from "@/lib/types";

// --- PRICING DATA ---
const PLANS = {
    solo: { name: 'Solo', weekly: 320, meals: 5, profiles: 1 },
    couple: { name: 'Couple', weekly: 590, meals: 10, profiles: 2 },
    family: { name: 'Family', weekly: 890, meals: 20, profiles: 4 },
};
const FIRST_WEEK_DISCOUNT = 0.10;

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
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuthStore();
    const { setSubscription } = useSubscriptionStore();
    const { addPoints } = usePointsStore();
    const { plan: plannerData } = usePlannerStore();
    const { meals } = useMealsStore();

    const [hasMounted, setHasMounted] = useState(false);
    const [method, setMethod] = useState<"card" | "paypal">("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const rawPlan = searchParams.get("plan");
    const planKey = (rawPlan && rawPlan in PLANS) ? (rawPlan as keyof typeof PLANS) : "solo";
    const selectedPlan = PLANS[planKey];

    // Auth guard
    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (hasMounted && !isAuthenticated) {
            router.replace(`/auth/signin?from=/checkout?plan=${planKey}`);
        }
    }, [hasMounted, isAuthenticated, router, planKey]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PaymentForm>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            fullName: user?.name || "",
            addressLine: user?.address || "",
        },
        mode: "onSubmit",
    });

    if (!hasMounted) return null;

    // Pricing
    const weeklyPrice = selectedPlan.weekly;
    const discountAmount = Math.round(weeklyPrice * FIRST_WEEK_DISCOUNT);
    const totalToday = weeklyPrice - discountAmount;

    // Meal List Extraction
    const plannedMealIds = plannerData.planned_meals.map(pm => pm.id);
    const selectedMeals = plannerData.planned_meals.map(pm => {
        const meal = meals.find(m => m.id === pm.meal_id);
        return meal ? { ...meal, pmId: pm.id } : null;
    }).filter(Boolean);

    // Aggregate Macros
    const totalMacros = selectedMeals.reduce((acc, m) => {
        if (!m) return acc;
        return {
            kcal: acc.kcal + (m.macros?.kcal || 0),
            protein: acc.protein + (m.macros?.protein_g || 0),
            carbs: acc.carbs + (m.macros?.carbs_g || 0),
            fats: acc.fats + (m.macros?.fats_g || 0),
        };
    }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

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
            plan: planKey as SubscriptionPlan,
            status: "active",
            orderId,
            startDate: new Date().toISOString()
        });
        addPoints(500); // 500 bonus for first order

        router.push(`/confirmation?orderId=${orderId}&plan=${planKey}`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Cinematic Header */}
            <header className="w-full h-24 flex items-center justify-between px-6 lg:px-12 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/40">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-serif text-3xl text-primary lowercase tracking-tight">nourishbox</span>
                </Link>
                <div className="flex items-center gap-3 text-primary/40">
                    <Lock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Checkout</span>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-12 items-start">
                
                {/* LEFT: Order Summary */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[40px] p-8 lg:p-12 shadow-[0_30px_60px_-15px_rgba(44,62,45,0.06)] border-[1.5px] border-border"
                >
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
                        <h2 className="font-serif text-4xl text-text-primary italic">Your Order</h2>
                        <Link href="/onboarding/reveal" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:tracking-[0.2em] transition-all">
                            Modify Plan
                        </Link>
                    </div>

                    {/* Meal List */}
                    <div className="space-y-8 mb-12">
                        {selectedMeals.length > 0 ? (
                            selectedMeals.map((meal: any, i) => (
                                <div key={meal.pmId} className="flex items-center gap-6 group">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-background border border-border shrink-0 shadow-sm relative">
                                        {meal.image_url ? (
                                            <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">{meal.emoji}</div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-serif text-xl text-text-primary truncate mb-1">{meal.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{meal.macros?.kcal} kcal</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Macro matched</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-sans font-bold text-text-primary whitespace-nowrap">
                                            {(selectedPlan.weekly / selectedPlan.meals).toFixed(0)} MAD
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center bg-background/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center gap-4">
                                <ShoppingBag size={40} className="text-text-muted/20" />
                                <p className="text-text-muted font-sans italic">Your plan is being assembled...</p>
                            </div>
                        )}
                    </div>

                    {/* Macro Summary Strip */}
                    <div className="bg-primary/[0.03] rounded-3xl p-6 lg:p-8 flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <BarChart2 size={24} className="text-primary" />
                            </div>
                            <div>
                                <h5 className="font-serif text-lg text-text-primary">Weekly Profile</h5>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Scientific Targets</p>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-right">
                                <span className="block font-serif text-xl text-primary leading-none mb-1">{totalMacros.protein}g</span>
                                <span className="text-[9px] font-bold text-text-muted uppercase">Protein</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-serif text-xl text-primary leading-none mb-1">{totalMacros.carbs}g</span>
                                <span className="text-[9px] font-bold text-text-muted uppercase">Carbs</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-serif text-xl text-primary leading-none mb-1">{totalMacros.fats}g</span>
                                <span className="text-[9px] font-bold text-text-muted uppercase">Fats</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4 font-sans mb-10">
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted font-medium uppercase tracking-[0.1em] text-xs">Subtotal</span>
                            <span className="font-bold text-text-primary">{weeklyPrice} MAD</span>
                        </div>
                        <div className="flex justify-between items-center text-primary">
                            <span className="font-medium uppercase tracking-[0.1em] text-xs">First Week 10% Discount</span>
                            <span className="font-bold">-{discountAmount} MAD</span>
                        </div>
                        <div className="flex justify-between items-center text-primary">
                            <span className="font-medium uppercase tracking-[0.1em] text-xs">Precision Shipping</span>
                            <span className="font-bold">FREE</span>
                        </div>
                    </div>

                    <div className="pt-8 border-t-[1.5px] border-border flex justify-between items-end">
                        <div>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] block mb-2">Total Due Today</span>
                            <span className="font-serif text-5xl lg:text-7xl text-text-primary leading-none tracking-tighter">{totalToday} <span className="text-lg">MAD</span></span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT: Delivery & Payment Form */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[40px] p-8 lg:p-10 shadow-[0_30px_60px_-15px_rgba(44,62,45,0.06)] border-[1.5px] border-border lg:sticky lg:top-32"
                >
                    <h2 className="font-serif text-3xl text-text-primary mb-10 italic">Delivery & Payment</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Section: Delivery */}
                        <div className="space-y-6">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                                <MapPin size={12} className="text-primary" /> Delivery Details
                            </span>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <input
                                        {...register("fullName")}
                                        placeholder="Full Representative Name"
                                        className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                    />
                                    {errors.fullName && <FieldError msg={errors.fullName.message!} />}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <input
                                            {...register("phone")}
                                            placeholder="Phone Number"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                        />
                                        {errors.phone && <FieldError msg={errors.phone.message!} />}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            {...register("city")}
                                            placeholder="City"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                        />
                                        {errors.city && <FieldError msg={errors.city.message!} />}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <input
                                        {...register("addressLine")}
                                        placeholder="Full Precise Street Address"
                                        className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                    />
                                    {errors.addressLine && <FieldError msg={errors.addressLine.message!} />}
                                </div>
                            </div>
                        </div>

                        {/* Section: Payment Method */}
                        <div className="space-y-6 pt-4">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                                <CreditCard size={12} className="text-primary" /> Secure Payment
                            </span>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMethod("card")}
                                    className={`flex-1 h-14 rounded-full border-2 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                                        method === "card" ? "border-primary bg-primary/5 text-primary" : "border-border text-text-muted hover:border-text-muted"
                                    }`}
                                >
                                    Debit / Credit Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod("paypal")}
                                    className={`flex-1 h-14 rounded-full border-2 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                                        method === "paypal" ? "border-primary bg-primary/5 text-primary" : "border-border text-text-muted hover:border-text-muted"
                                    }`}
                                >
                                    PayPal
                                </button>
                            </div>

                            {method === "card" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="space-y-1">
                                        <input
                                            {...register("cardName")}
                                            placeholder="Name on Card"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                        />
                                        {errors.cardName && <FieldError msg={errors.cardName.message!} />}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            {...register("cardNumber")}
                                            onChange={handleCardNumberChange}
                                            placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                                            className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans tracking-[0.1em]"
                                        />
                                        {errors.cardNumber && <FieldError msg={errors.cardNumber.message!} />}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <input
                                                {...register("expiry")}
                                                onChange={handleExpiryChange}
                                                placeholder="MM/YY"
                                                className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                            />
                                            {errors.expiry && <FieldError msg={errors.expiry.message!} />}
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                {...register("cvv")}
                                                onChange={handleCVVChange}
                                                type="password"
                                                placeholder="CVV"
                                                className="w-full h-14 px-6 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-sans"
                                            />
                                            {errors.cvv && <FieldError msg={errors.cvv.message!} />}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {formError && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-[10px] font-bold uppercase tracking-widest text-center">
                                {formError}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isProcessing}
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-20 bg-primary text-background rounded-full font-serif text-2xl shadow-[0_20px_40px_-10px_rgba(44,62,45,0.4)] flex items-center justify-center gap-4 group transition-all"
                        >
                            {isProcessing ? (
                                <Loader2 size={28} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Place Order</span>
                                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                        
                        <div className="flex flex-col items-center gap-6 mt-12">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                    <ShieldCheck size={20} className="text-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Secure</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                    <Clock size={20} className="text-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Flexibility</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                    <RotateCcw size={20} className="text-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Cancelable</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-text-muted text-center leading-relaxed max-w-[300px] uppercase font-bold tracking-widest opacity-50">
                                256-bit AES encryption • SSL certificate active • PCI-DSS compliant infrastructure
                            </p>
                        </div>
                    </form>
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
