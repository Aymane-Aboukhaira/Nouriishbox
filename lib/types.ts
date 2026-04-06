// ============================================================
// NOURISHBOX — Core Types
// ============================================================

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";
export type MealTier = "budget" | "standard" | "premium" | "kids";
export type ActivityLevel =
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
export type Goal = "weight_loss" | "muscle_gain" | "maintenance" | "balance";
export type Persona = "student" | "gym_rat" | "parent" | "professional" | "other";
export type SubscriptionPlan = "starter_3" | "balanced_5" | "premium_7" | "solo" | "couple" | "family";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";
export type OrderStatus =
    | "pending"
    | "preparing"
    | "out_for_delivery"
    | "delivered";
export type PlantStage = "seed" | "sprout" | "sapling" | "tree" | "forest";
export type Relation = "self" | "partner" | "child" | "parent" | "other";

export interface Macro {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g?: number;
}

export interface Meal {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: MealCategory;
    image_url: string;
    emoji: string;
    macros: Macro;
    prep_time_min: number;
    is_vegan: boolean;
    is_halal: boolean;
    is_gluten_free: boolean;
    allergens: string[];
    tags: string[];
    ingredients?: string[];
    is_active: boolean;
    /** Admin-friendly alias for `is_active`. When passed to updateMealData,
     *  it is normalised to `is_active` so the two stay in sync. */
    isAvailable?: boolean;
    price_mad: number;
    tier: MealTier;
}

export interface TastePreferences {
    dislikes: string[];
    spiceTolerance: 'none' | 'medium' | 'high';
    dietLeaning: 'none' | 'pescatarian' | 'plant_based' | 'meat_heavy';
}

export interface FamilyMember {
    id: string;
    name: string;
    relation: Relation;
    avatar_color: string;
    age?: number;
    goal: Goal;
    daily_kcal: number;
    assigned_meal_ids: string[];
    savedLocations?: SavedLocation[];
    taste_leaning?: 'none' | 'pescatarian' | 'plant_based' | 'meat_heavy';
}

export interface PlannedMeal {
    id: string;
    meal_id: string;
    day_index: number; // 0=Mon ... 6=Sun
    family_member_id?: string;
    status: "planned" | "confirmed" | "skipped";
}

export interface WeeklyPlan {
    id: string;
    week_offset: number; // 0 = current week
    planned_meals: PlannedMeal[];
    paused_days: number[]; // day indices that are paused
    confirmed: boolean;
}

export interface Subscription {
    id: string;
    user_id: string;
    status: SubscriptionStatus;
    people_count: number;
    days_per_week: number;
    meals_per_day: number;
    price_mad: number; // Weekly Total
    starts_at: string;
    renews_at: string;
    paused_until?: string;
}

export interface OrderItem {
    meal_id: string;
    meal_name: string;
    meal_emoji: string;
    price_at_order: number;
    quantity: number;
}

export interface Order {
    id: string;
    user_id: string;
    user_name: string;
    status: OrderStatus;
    items: OrderItem[];
    people_count: number;
    days_per_week: number;
    discount_percent: number;
    total_mad: number;
    created_at: string;
    address: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar_color: string;
    goal: Goal;
    persona: Persona;
    activity_level: ActivityLevel;
    height_cm: number;
    weight_kg: number;
    age: number;
    gender: "male" | "female";
    daily_targets: Macro;
    subscription?: Subscription;
    language: "fr" | "ar" | "en";
}

export interface NourishPoints {
    balance: number;
    streak: number;
    longest_streak: number;
    plant_stage: PlantStage;
    last_active: string;
}

export interface MacroLog {
    date: string;
    consumed: Macro;
    target: Macro;
    adherence: number; // 0–100%
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface AdminMetrics {
    mrr_mad: number;
    active_subscribers: number;
    delivery_success_rate: number;
    churn_rate: number;
    new_this_week: number;
    weekly_revenue: { week: string; revenue: number }[];
    top_meals: { meal_id: string; name: string; orders: number }[];
}

// ──────────────────────────────────────────────────────────────
// DELIVERY SCHEDULING
// ──────────────────────────────────────────────────────────────

/** Available delivery time windows */
export type DeliveryTimeSlot = "07:00" | "12:30" | "18:00" | "21:00";

/** Saved delivery location labels */
export type DeliveryLocation = "home" | "office" | "campus" | "gym" | "school" | "other";

export interface SavedLocation {
    tag: DeliveryLocation;
    address: string;
    timeSlot: DeliveryTimeSlot;
}

export interface DeliverySchedule {
    id: string;
    date: string; // ISO date string, e.g. "2026-04-07"
    timeSlot: DeliveryTimeSlot;
    location: DeliveryLocation;
    /** Optional freeform address override */
    addressOverride?: string;
    /** Meal IDs included in this delivery */
    meal_ids: string[];
    notes?: string;
}

/**
 * Per-planned-meal delivery assignment.
 * Stored as Record<plannedMealId, MealDeliveryAssignment> in usePlannerStore.
 * Never duplicated — always looked up by plannedMealId.
 */
export interface MealDeliveryAssignment {
    timeSlot: DeliveryTimeSlot;
    location: DeliveryLocation;
}

/**
 * Saved physical addresses keyed by location label.
 * Stored in useProfileStore.
 * Used to validate location choices before confirming the week.
 */
export type SavedAddresses = Partial<Record<DeliveryLocation, string>>;

