"use client";
// ============================================================
// NOURISHBOX — Zustand Global Store with Persistence
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type {
    Meal,
    WeeklyPlan,
    PlannedMeal,
    FamilyMember,
    Order,
    OrderStatus,
    Subscription,
    SubscriptionPlan,
    SubscriptionStatus,
    NourishPoints,
    ChatMessage,
    MacroLog,
    ActivityLevel,
    Goal,
    Macro,
    TastePreferences,
    DeliverySchedule,
    DeliveryTimeSlot,
    DeliveryLocation,
    MealDeliveryAssignment,
    SavedAddresses,
} from "./types";
import {
    MOCK_MEALS,
    MOCK_WEEKLY_PLAN,
    MOCK_FAMILY_MEMBERS,
    MOCK_ORDERS,
    MOCK_SUBSCRIPTION,
    MOCK_NOURISH_POINTS,
    MOCK_CLINIC_MESSAGES,
    MOCK_MACRO_LOGS,
    MOCK_TODAY_CONSUMED,
    MOCK_ADMIN_USERS,
} from "./mock-data";
import { generateId } from "./utils";

// ──────────────────────────────────────────────────────────────
// MEALS STORE (Single Source of Truth — acts as the frontend DB)
// ──────────────────────────────────────────────────────────────
interface MealsState {
    /**
     * masterMealsList — the canonical array of all Meal objects.
     * Exposed as `meals` so existing consumers need zero changes.
     * Admin actions write here; client UI reads from here.
     * Never duplicate meal data elsewhere — store only mealId references.
     */
    meals: Meal[];
    addMeal: (meal: Omit<Meal, "id">) => void;
    updateMeal: (id: string, updates: Partial<Meal>) => void;
    deleteMeal: (id: string) => void;
    toggleMealActive: (id: string) => void;
    /**
     * updateMealData — the primary admin write action.
     * Simulates an async API PATCH call (350ms delay) so swapping to a
     * real backend later only requires replacing the setTimeout.
     * Accepts any subset of Meal fields including the admin-friendly
     * `isAvailable` alias which is normalised to `is_active`.
     */
    updateMealData: (mealId: string, updatedFields: Partial<Meal>) => Promise<void>;
    /** Inline selector — reads live from masterMealsList by ID. */
    getMealById: (id: string) => Meal | undefined;
    resetStore: () => void;
}

export const useMealsStore = create<MealsState>()(
    persist(
        (set, get) => ({
            meals: MOCK_MEALS,
            addMeal: (meal) =>
                set((state) => ({
                    meals: [...state.meals, { ...meal, id: generateId() }],
                })),
            updateMeal: (id, updates) =>
                set((state) => ({
                    meals: state.meals.map((m) => (m.id === id ? { ...m, ...updates } : m)),
                })),
            deleteMeal: (id) =>
                set((state) => ({
                    meals: state.meals.filter((m) => m.id !== id),
                })),
            toggleMealActive: (id) =>
                set((state) => ({
                    meals: state.meals.map((m) =>
                        m.id === id ? { ...m, is_active: !m.is_active } : m
                    ),
                })),
            updateMealData: async (mealId, updatedFields) => {
                // Simulate a ~350ms network round-trip (PATCH /api/meals/:id)
                await new Promise<void>((resolve) => setTimeout(resolve, 350));
                // Normalise isAvailable alias → is_active so both fields stay in sync
                const { isAvailable, ...rest } = updatedFields;
                const normalised: Partial<Meal> = { ...rest };
                if (isAvailable !== undefined) normalised.is_active = isAvailable;
                set((state) => ({
                    meals: state.meals.map((m) =>
                        m.id === mealId ? { ...m, ...normalised } : m
                    ),
                }));
            },
            getMealById: (id) => get().meals.find((m) => m.id === id),
            resetStore: () => set({ meals: MOCK_MEALS }),
        }),
        { 
            name: "nourishbox-meals",
            onRehydrateStorage: () => (state) => {
                // Robust verification: If store is empty, incomplete, or missing images
                if (state) {
                    const isStale = state.meals.length < MOCK_MEALS.length;
                    const hasMissingImages = state.meals.some(m => !m.image_url);
                    const hasLegacyPaths = state.meals.some(m => m.image_url.includes(" ") || m.image_url.includes("/public/"));
                    
                    if (isStale || hasMissingImages || hasLegacyPaths) {
                        console.log("Stale or legacy meal data detected. Hard-syncing with latest hyphenated assets...");
                        state.resetStore();
                    }
                }
            }
        }
    )
);

// ──────────────────────────────────────────────────────────────
// PLANNER STORE (Weekly Plan + DnD)
// ──────────────────────────────────────────────────────────────
interface PlannerState {
    plan: WeeklyPlan;
    /**
     * Per-planned-meal delivery assignments.
     * Key = PlannedMeal.id. Never store full meal objects here — mealId only.
     */
    deliveryAssignments: Record<string, MealDeliveryAssignment>;
    addMealToDay: (day_index: number, meal_id: string, family_member_id?: string) => void;
    assignMeal: (dayKey: string, mealId: string, family_member_id?: string) => void;
    removeMealFromDay: (plannedMealId: string) => void;
    moveMeal: (plannedMealId: string, newDayIndex: number) => void;
    swapMeal: (plannedMealId: string, newMealId: string) => void;
    togglePauseDay: (day_index: number) => void;
    confirmPlan: () => void;
    unconfirmPlan: () => void;
    setConfirmed: (confirmed: boolean) => void;
    updateMealStatus: (plannedMealId: string, status: "planned" | "confirmed" | "skipped") => void;
    setDeliveryAssignment: (pmId: string, assignment: MealDeliveryAssignment) => void;
    clearDeliveryAssignment: (pmId: string) => void;
    clearMemberPlan: (memberId: string) => void;
    
    // MVP Jury Pitch Fields
    plannerDays?: any[]; // To avoid circular imports, just use any[] or import PlannerDay if willing to tangle
    setupAutoWeek: (days: any[]) => void;
}

export const usePlannerStore = create<PlannerState>()(
    persist(
        (set) => ({
            plan: { ...MOCK_WEEKLY_PLAN, planned_meals: [] }, // Start empty to clearly show auto-population
            deliveryAssignments: {},
            plannerDays: undefined,
            setupAutoWeek: (days) => set((state) => {
                const newAssignments: Record<string, any> = {};
                const newPlannedMeals: any[] = [];
                days.forEach(day => {
                    day.meals.forEach((m: any) => {
                        newPlannedMeals.push({
                            id: m.plannedMealId,
                            meal_id: m.meal.id,
                            day_index: day.dayIndex,
                            family_member_id: m.familyMemberId,
                            status: "planned",
                        });
                        newAssignments[m.plannedMealId] = m.delivery;
                    });
                });
                return {
                    plannerDays: days,
                    plan: { ...state.plan, planned_meals: newPlannedMeals },
                    deliveryAssignments: { ...state.deliveryAssignments, ...newAssignments }
                };
            }),
            addMealToDay: (day_index, meal_id, family_member_id) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        planned_meals: [
                            ...state.plan.planned_meals,
                            {
                                id: generateId(),
                                meal_id,
                                day_index,
                                family_member_id,
                                status: "planned" as const,
                            },
                        ],
                    },
                })),
            assignMeal: (dayKey, mealId, family_member_id) =>
                set((state) => {
                    const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
                    // Support English fallback just in case, though the UI will use French labels for consistency if we use LABELS array
                    const enDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                    let dayIndex = enDays.indexOf(dayKey.toLowerCase());
                    if (dayIndex === -1) {
                        dayIndex = days.indexOf(dayKey.toLowerCase() as any);
                    }
                    if (dayIndex === -1) return state; // Ignore invalid keys
                    return {
                        plan: {
                            ...state.plan,
                            planned_meals: [
                                ...state.plan.planned_meals,
                                {
                                    id: generateId(),
                                    meal_id: mealId,
                                    day_index: dayIndex,
                                    family_member_id,
                                    status: "planned" as const,
                                },
                            ],
                        },
                    };
                }),
            removeMealFromDay: (plannedMealId) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        planned_meals: state.plan.planned_meals.filter(
                            (pm) => pm.id !== plannedMealId
                        ),
                    },
                })),
            moveMeal: (plannedMealId, newDayIndex) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        planned_meals: state.plan.planned_meals.map((pm) =>
                            pm.id === plannedMealId ? { ...pm, day_index: newDayIndex } : pm
                        ),
                    },
                })),
            swapMeal: (plannedMealId, newMealId) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        planned_meals: state.plan.planned_meals.map((pm) =>
                            pm.id === plannedMealId ? { ...pm, meal_id: newMealId } : pm
                        ),
                    },
                })),
            togglePauseDay: (day_index) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        paused_days: state.plan.paused_days.includes(day_index)
                            ? state.plan.paused_days.filter((d) => d !== day_index)
                            : [...state.plan.paused_days, day_index],
                    },
                })),
            confirmPlan: () =>
                set((state) => ({
                    plan: { ...state.plan, confirmed: true },
                })),
            unconfirmPlan: () =>
                set((state) => ({
                    plan: { ...state.plan, confirmed: false },
                })),
            setConfirmed: (confirmed) =>
                set((state) => ({
                    plan: { ...state.plan, confirmed },
                })),
            updateMealStatus: (plannedMealId, status) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        planned_meals: state.plan.planned_meals.map((pm) =>
                            pm.id === plannedMealId ? { ...pm, status } : pm
                        ),
                    },
                })),
            setDeliveryAssignment: (pmId, assignment) =>
                set((state) => ({
                    deliveryAssignments: { ...state.deliveryAssignments, [pmId]: assignment },
                })),
            clearDeliveryAssignment: (pmId) =>
                set((state) => {
                    const next = { ...state.deliveryAssignments };
                    delete next[pmId];
                    return { deliveryAssignments: next };
                }),
            clearMemberPlan: (memberId: string) =>
                set((state) => ({
                    plan: {
                        ...state.plan,
                        planned_meals: state.plan.planned_meals.filter((pm) => pm.family_member_id !== memberId),
                    },
                })),
        }),
        { name: "nourishbox-planner" }
    )
);

// ──────────────────────────────────────────────────────────────
// FAMILY STORE
// ──────────────────────────────────────────────────────────────
interface FamilyState {
    members: FamilyMember[];
    activeMemberId: string;
    setActiveMember: (id: string) => void;
    addMember: (member: Omit<FamilyMember, "id" | "assigned_meal_ids">) => void;
    updateMember: (id: string, updates: Partial<FamilyMember>) => void;
    removeMember: (id: string) => void;
    assignMeal: (memberId: string, mealId: string) => void;
    unassignMeal: (memberId: string, mealId: string) => void;
    setupFamily: (adults: number, children: number) => void;
}

export const useFamilyStore = create<FamilyState>()(
    persist(
        (set) => ({
            members: MOCK_FAMILY_MEMBERS,
            activeMemberId: "f1",
            setActiveMember: (id) => set({ activeMemberId: id }),
            addMember: (member) =>
                set((state) => ({
                    members: [
                        ...state.members,
                        { ...member, id: generateId(), assigned_meal_ids: [] },
                    ],
                })),
            updateMember: (id, updates) =>
                set((state) => ({
                    members: state.members.map((m) =>
                        m.id === id ? { ...m, ...updates } : m
                    ),
                })),
            removeMember: (id) =>
                set((state) => ({
                    members: state.members.filter((m) => m.id !== id),
                })),
            assignMeal: (memberId, mealId) =>
                set((state) => ({
                    members: state.members.map((m) =>
                        m.id === memberId && !m.assigned_meal_ids.includes(mealId)
                            ? { ...m, assigned_meal_ids: [...m.assigned_meal_ids, mealId] }
                            : m
                    ),
                })),
            unassignMeal: (memberId, mealId) =>
                set((state) => ({
                    members: state.members.map((m) =>
                        m.id === memberId
                            ? { ...m, assigned_meal_ids: m.assigned_meal_ids.filter((id) => id !== mealId) }
                            : m
                    ),
                })),
            setupFamily: (adults, children) =>
                set((state) => {
                    // Keep 'self' (primary user)
                    // In our current data, the primary user is f1 or u1.
                    // We'll keep members whose relation is 'self'.
                    const selfMember = state.members.find(m => m.relation === "self");
                    const newMembers: any[] = selfMember ? [selfMember] : [];
                    
                    // Create Adults (other than self)
                    // If Adults = 2, we need 1 more (partner)
                    for (let i = 1; i < adults; i++) {
                        newMembers.push({
                            id: `adult-${i}-${Date.now()}`,
                            name: `Adult ${i + 1}`,
                            relation: "partner",
                            avatar_color: "#B09AE0",
                            goal: "maintenance",
                            daily_kcal: 2000,
                            assigned_meal_ids: []
                        });
                    }
                    
                    // Create Children
                    for (let i = 0; i < children; i++) {
                        newMembers.push({
                            id: `child-${i}-${Date.now()}`,
                            name: `Child ${i + 1}`,
                            relation: "child",
                            avatar_color: "#FFA07A",
                            goal: "balance",
                            daily_kcal: 1500,
                            assigned_meal_ids: []
                        });
                    }
                    
                    return { members: newMembers };
                }),
        }),
        { name: "nourishbox-family" }
    )
);

// ──────────────────────────────────────────────────────────────
// ORDERS STORE (Admin Kanban)
// ──────────────────────────────────────────────────────────────
interface OrdersState {
    orders: Order[];
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    addOrder: (order: Omit<Order, "id" | "created_at">) => void;
}

export const useOrdersStore = create<OrdersState>()(
    persist(
        (set) => ({
            orders: MOCK_ORDERS,
            updateOrderStatus: (orderId, status) =>
                set((state) => ({
                    orders: state.orders.map((o) =>
                        o.id === orderId ? { ...o, status } : o
                    ),
                })),
            addOrder: (order) =>
                set((state) => ({
                    orders: [
                        ...state.orders,
                        {
                            ...order,
                            id: generateId(),
                            created_at: new Date().toISOString(),
                        },
                    ],
                })),
        }),
        { name: "nourishbox-orders" }
    )
);

// ──────────────────────────────────────────────────────────────
// SUBSCRIPTION STORE
// ──────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────
// ONBOARDING STORE (Build Your Week)
// ──────────────────────────────────────────────────────────────
interface OnboardingState {
    selections: {
        peopleCount: number;
        daysPerWeek: number;
        mealsPerDay: number;
        selectedMealIds: string[];
    };
    updateSelections: (updates: Partial<OnboardingState["selections"]>) => void;
    toggleMeal: (mealId: string) => void;
    clearSelections: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            selections: {
                peopleCount: 1,
                daysPerWeek: 5,
                mealsPerDay: 1,
                selectedMealIds: [],
            },
            updateSelections: (updates) =>
                set((state) => ({ selections: { ...state.selections, ...updates } })),
            toggleMeal: (mealId) =>
                set((state) => {
                    const exists = state.selections.selectedMealIds.includes(mealId);
                    const maxAllowed = state.selections.peopleCount * state.selections.daysPerWeek * state.selections.mealsPerDay;
                    
                    if (exists) {
                        return {
                            selections: {
                                ...state.selections,
                                selectedMealIds: state.selections.selectedMealIds.filter(id => id !== mealId)
                            }
                        };
                    } else {
                        // Normally we limit or just add. Let's just add for now and handle limits in UI.
                        return {
                            selections: {
                                ...state.selections,
                                selectedMealIds: [...state.selections.selectedMealIds, mealId]
                            }
                        };
                    }
                }),
            clearSelections: () => set({ 
                selections: { peopleCount: 1, daysPerWeek: 5, mealsPerDay: 1, selectedMealIds: [] } 
            }),
        }),
        { name: "nourishbox-onboarding-v2" }
    )
);

// ──────────────────────────────────────────────────────────────
// SUBSCRIPTION STORE
// ──────────────────────────────────────────────────────────────
interface SubscriptionState {
    subscription: Subscription & { skippedWeeks?: string[] };
    pauseSubscription: (weeks: number | string) => void;
    resumeSubscription: () => void;
    cancelSubscription: () => void;
    updateStatus: (status: SubscriptionStatus) => void;
    setSubscription: (data: Partial<Subscription>) => void;
    skipWeek: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set) => ({
            subscription: { ...MOCK_SUBSCRIPTION, skippedWeeks: [] },
            pauseSubscription: (weeksOrUntil) =>
                set((state) => {
                    let untilStr = typeof weeksOrUntil === 'string' ? weeksOrUntil : '';
                    if (typeof weeksOrUntil === 'number') {
                        const d = new Date();
                        d.setDate(d.getDate() + weeksOrUntil * 7);
                        untilStr = d.toISOString();
                    }
                    return {
                        subscription: {
                            ...state.subscription,
                            status: "paused",
                            paused_until: untilStr,
                        },
                    };
                }),
            resumeSubscription: () =>
                set((state) => ({
                    subscription: {
                        ...state.subscription,
                        status: "active",
                        paused_until: undefined,
                    },
                })),
            cancelSubscription: () =>
                set((state) => ({
                    subscription: { ...state.subscription, status: "cancelled" },
                })),
            updateStatus: (status) =>
                set((state) => ({
                    subscription: { ...state.subscription, status },
                })),
            setSubscription: (data) =>
                set((state) => ({
                    subscription: {
                        ...state.subscription,
                        ...data,
                    },
                })),
            skipWeek: () =>
                set((state) => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    return {
                        subscription: {
                            ...state.subscription,
                            skippedWeeks: [...(state.subscription.skippedWeeks || []), d.toISOString()],
                        }
                    }
                }),
        }),
        { name: "nourishbox-subscription" }
    )
);

// ──────────────────────────────────────────────────────────────
// NOURISH POINTS STORE
// ──────────────────────────────────────────────────────────────
export interface PointTransaction {
    id: string;
    amount: number;
    reason: string;
    date: string;
}

interface PointsState {
    points: NourishPoints;
    history: PointTransaction[];
    todayConsumed: typeof MOCK_TODAY_CONSUMED;
    addPoints: (delta: number, reason?: string) => void;
}

export const usePointsStore = create<PointsState>()(
    persist(
        (set) => ({
            points: MOCK_NOURISH_POINTS,
            history: [],
            todayConsumed: MOCK_TODAY_CONSUMED,
            addPoints: (delta, reason = "Earned points") =>
                set((state) => ({
                    points: { ...state.points, balance: state.points.balance + delta },
                    history: [
                        { id: generateId(), amount: delta, reason, date: new Date().toISOString() },
                        ...state.history,
                    ]
                })),
        }),
        { name: "nourishbox-points" }
    )
);

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS STORE (Sprint 6)
// ──────────────────────────────────────────────────────────────
export interface AppNotification {
    id: string;
    type: 'streak' | 'planner' | 'meal' | 'points';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionLink?: string;
}

interface NotificationState {
    notifications: AppNotification[];
    addNotification: (notif: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],
            addNotification: (notif) =>
                set((state) => ({
                    notifications: [
                        {
                            ...notif,
                            id: generateId(),
                            isRead: false,
                            createdAt: new Date().toISOString(),
                        },
                        ...state.notifications,
                    ]
                })),
            markAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    ),
                })),
            markAllAsRead: () =>
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                })),
            clearAll: () => set({ notifications: [] }),
        }),
        { name: "nourishbox-notifications" }
    )
);

// ──────────────────────────────────────────────────────────────
// CLINIC STORE (Simulated AI Chat)
// ──────────────────────────────────────────────────────────────
interface ClinicState {
    messages: ChatMessage[];
    isTyping: boolean;
    addMessage: (message: ChatMessage) => void;
    setTyping: (typing: boolean) => void;
    clearMessages: () => void;
}

export const useClinicStore = create<ClinicState>()(
    persist(
        (set) => ({
            messages: MOCK_CLINIC_MESSAGES,
            isTyping: false,
            addMessage: (message) =>
                set((state) => ({ messages: [...state.messages, message] })),
            setTyping: (typing) => set({ isTyping: typing }),
            clearMessages: () => set({ messages: MOCK_CLINIC_MESSAGES }),
        }),
        { name: "nourishbox-clinic" }
    )
);

// ──────────────────────────────────────────────────────────────
// ANALYTICS STORE
// ──────────────────────────────────────────────────────────────
interface AnalyticsState {
    logs: MacroLog[];
}

export const useAnalyticsStore = create<AnalyticsState>()(
    persist(
        () => ({
            logs: MOCK_MACRO_LOGS,
        }),
        { name: "nourishbox-analytics" }
    )
);

// ──────────────────────────────────────────────────────────────
// ADMIN USERS STORE
// ──────────────────────────────────────────────────────────────
type AdminUser = (typeof MOCK_ADMIN_USERS)[0];
interface AdminUsersState {
    users: AdminUser[];
    updateUserStatus: (id: string, status: string) => void;
}

export const useAdminUsersStore = create<AdminUsersState>()(
    persist(
        (set) => ({
            users: MOCK_ADMIN_USERS,
            updateUserStatus: (id, status) =>
                set((state) => ({
                    users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
                })),
        }),
        { name: "nourishbox-admin-users" }
    )
);

// ──────────────────────────────────────────────────────────────
// PROFILE STORE (Client Onboarding)
// ──────────────────────────────────────────────────────────────
interface ProfileState {
    profile: {
        name: string;
        age: number;
        gender: "male" | "female" | "";
        height_cm: number;
        weight_kg: number;
        activity_level: ActivityLevel | "";
        goal: Goal | "";
        diet: {
            is_halal: boolean;
            is_vegan: boolean;
            is_vegetarian: boolean;
            is_gluten_free: boolean;
        };
        targets: Macro | null;
        allergens: string[];
        notifications: Record<string, boolean>;
        macroDisplayUnit: 'grams' | 'percent';
        weekStartDay: 'monday' | 'sunday';
        tastePreferences: TastePreferences;
        /** Saved physical addresses used for delivery location validation */
        savedAddresses: SavedAddresses;
    };
    updateProfile: (updates: Partial<ProfileState["profile"]>) => void;
    updateDiet: (updates: Partial<ProfileState["profile"]["diet"]>) => void;
    setTargets: (targets: Macro) => void;
    updateMacros: (updates: Partial<ProfileState["profile"]>) => void;
    setNotificationPref: (key: string, value: boolean) => void;
    setAllergens: (allergens: string[]) => void;
    setDisplayPref: (key: 'macroDisplayUnit' | 'weekStartDay', value: any) => void;
    setTastePreferences: (prefs: TastePreferences) => void;
    /** Save or update a physical address for a delivery location */
    setSavedAddress: (location: DeliveryLocation, address: string) => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            profile: {
                name: "",
                age: 0,
                gender: "",
                height_cm: 0,
                weight_kg: 0,
                activity_level: "",
                goal: "",
                diet: {
                    is_halal: true,
                    is_vegan: false,
                    is_vegetarian: false,
                    is_gluten_free: false,
                },
                targets: null,
                allergens: [],
                notifications: {
                    plan_reminder: true,
                    delivery_updates: true,
                    macro_checkin: true,
                    streak_alerts: true,
                    new_meals: true
                },
                macroDisplayUnit: 'grams',
                weekStartDay: 'monday',
                tastePreferences: {
                    dislikes: [],
                    spiceTolerance: 'medium',
                    dietLeaning: 'none',
                },
                savedAddresses: {},
            },
            updateProfile: (updates) =>
                set((state) => ({ profile: { ...state.profile, ...updates } })),
            updateDiet: (updates) =>
                set((state) => ({
                    profile: {
                        ...state.profile,
                        diet: { ...state.profile.diet, ...updates },
                    },
                })),
            setTargets: (targets) =>
                set((state) => ({ profile: { ...state.profile, targets } })),
            updateMacros: (updates) =>
                set((state) => ({ profile: { ...state.profile, ...updates } })),
            setNotificationPref: (key, value) =>
                set((state) => ({
                    profile: {
                        ...state.profile,
                        notifications: { ...state.profile.notifications, [key]: value }
                    }
                })),
            setAllergens: (allergens) =>
                set((state) => ({ profile: { ...state.profile, allergens } })),
            setDisplayPref: (key, value) =>
                set((state) => ({ profile: { ...state.profile, [key]: value } })),
            setTastePreferences: (prefs) =>
                set((state) => ({ profile: { ...state.profile, tastePreferences: prefs } })),
            setSavedAddress: (location, address) =>
                set((state) => ({
                    profile: {
                        ...state.profile,
                        savedAddresses: { ...state.profile.savedAddresses, [location]: address },
                    },
                })),
        }),
        { name: "nourishbox-profile" }
    )
);

// ──────────────────────────────────────────────────────────────
// AUTH STORE (Cookie Persisted)
// ──────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    updateUser: (updates: Partial<AuthUser>) => void;
    signUp: (data: Omit<AuthUser, 'id' | 'createdAt'>) => void;
    signIn: (email: string) => boolean;
    signOut: () => void;
}

const cookieStorage: StateStorage = {
    getItem: (name: string) => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    },
    setItem: (name: string, value: string) => {
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=604800`;
    },
    removeItem: (name: string) => {
        document.cookie = `${name}=; path=/; max-age=0`;
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            updateUser: (updates) =>
                set((state) => {
                    if (!state.user) return state;
                    const newUser = { ...state.user, ...updates };
                    
                    // Keep profile name in sync
                    if (updates.name) {
                       useProfileStore.getState().updateProfile({ name: updates.name });
                    }
                    
                    return { user: newUser };
                }),
            signUp: (data) => {
                const newUser: AuthUser = {
                    ...data,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                };

                // Also update the profile store name immediately
                useProfileStore.getState().updateProfile({ name: data.name });

                set({ user: newUser, isAuthenticated: true });
            },
            signIn: (email) => {
                const state = useAuthStore.getState();
                if (state.user?.email === email) {
                    set({ isAuthenticated: true });
                    return true;
                }
                return false;
            },
            signOut: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => cookieStorage)
        }
    )
);

// ──────────────────────────────────────────────────────────────
// DELIVERY STORE (A-la-carte scheduling)
// ──────────────────────────────────────────────────────────────

// Re-export delivery types for convenience so consumers can import from the store
export type { DeliverySchedule, DeliveryTimeSlot, DeliveryLocation };

interface DeliveryState {
    schedules: DeliverySchedule[];
    /** Add or overwrite a delivery schedule (upsert by id) */
    upsertSchedule: (schedule: DeliverySchedule) => void;
    /** Remove a scheduled delivery */
    removeSchedule: (id: string) => void;
    /** Update a single field on an existing schedule */
    updateSchedule: (id: string, updates: Partial<Omit<DeliverySchedule, "id">>) => void;
    /** Clear all scheduled deliveries */
    clearSchedules: () => void;
}

const MOCK_DELIVERY_SCHEDULES: DeliverySchedule[] = [
    {
        id: "ds1",
        date: "2026-04-07",
        timeSlot: "12:30",
        location: "home",
        meal_ids: ["m1", "m4"],
        notes: "Leave at the door",
    },
    {
        id: "ds2",
        date: "2026-04-07",
        timeSlot: "18:00",
        location: "office",
        meal_ids: ["m5"],
    },
    {
        id: "ds3",
        date: "2026-04-09",
        timeSlot: "07:00",
        location: "gym",
        meal_ids: ["m8", "m12"],
        notes: "Protein snacks for post-workout",
    },
];

export const useDeliveryStore = create<DeliveryState>()(
    persist(
        (set) => ({
            schedules: MOCK_DELIVERY_SCHEDULES,
            upsertSchedule: (schedule) =>
                set((state) => {
                    const exists = state.schedules.some((s) => s.id === schedule.id);
                    return {
                        schedules: exists
                            ? state.schedules.map((s) => (s.id === schedule.id ? schedule : s))
                            : [...state.schedules, schedule],
                    };
                }),
            removeSchedule: (id) =>
                set((state) => ({
                    schedules: state.schedules.filter((s) => s.id !== id),
                })),
            updateSchedule: (id, updates) =>
                set((state) => ({
                    schedules: state.schedules.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                })),
            clearSchedules: () => set({ schedules: [] }),
        }),
        { name: "nourishbox-delivery" }
    )
);
