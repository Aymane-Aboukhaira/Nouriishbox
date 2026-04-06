import type { Meal, FamilyMember, DeliveryLocation, DeliveryTimeSlot } from "./types";
import { generateId } from "./utils";

export interface PlannerDay {
    dayIndex: number;
    meals: {
        plannedMealId: string;
        meal: Meal;
        familyMemberId: string;
        delivery: {
            location: DeliveryLocation;
            timeSlot: DeliveryTimeSlot;
        }
    }[];
}

export function buildAutoWeek(
    profile: any,
    allMeals: Meal[],
    familyMembers: FamilyMember[]
): PlannerDay[] {
    const daysToFill = [0, 1, 2]; // Monday, Tuesday, Wednesday
    const results: PlannerDay[] = [];
    const members = [{ id: "u1", ...profile, relation: "self" }, ...familyMembers];
    
    // Sort meals to prioritize budget/standard
    const budgetStandardMeals = allMeals.filter(m => m.tier === "budget" || m.tier === "standard");
    const premiumMeals = allMeals.filter(m => m.tier === "premium" || m.tier === "kids"); // Kids is treated separately if needed

    daysToFill.forEach(dayIndex => {
        const day: PlannerDay = { dayIndex, meals: [] };
        
        members.forEach((member, i) => {
            // Find a meal matching the goal
            let candidates = [...budgetStandardMeals];
            
            // Safe Defaults if metrics are missing (Family Mode Fast-track)
            const kcalTarget = member.daily_kcal > 0 ? member.daily_kcal : (member.relation === 'child' ? 1500 : 2000);
            const proteinTarget = kcalTarget * 0.3 / 4; // 30% protein baseline for filtering
            
            // Just a basic goal heuristic
            if (member.goal === "muscle_gain") {
                candidates = candidates.filter(m => m.macros.protein_g > proteinTarget / 3 + 5); 
                if (candidates.length === 0) candidates = [...allMeals].filter(m => m.macros.protein_g > 25);
            } else if (member.goal === "weight_loss") {
                candidates = candidates.filter(m => m.macros.kcal < (kcalTarget / 3) - 50);
                if (candidates.length === 0) candidates = [...allMeals].filter(m => m.macros.kcal < 500);
            } else if (member.relation === 'child') {
                // Prioritize kids tier if it's a child
                const kidsMeals = allMeals.filter(m => m.tier === 'kids');
                if (kidsMeals.length > 0) candidates = [...kidsMeals, ...candidates];
            }

            // Apply taste leaning filters
            if (member.taste_leaning === 'pescatarian') {
                const pesca = candidates.filter(m => m.is_vegan || m.tags.some(t => ['seafood', 'fish'].includes(t.toLowerCase())));
                if (pesca.length > 0) candidates = pesca;
            } else if (member.taste_leaning === 'plant_based') {
                const vegan = candidates.filter(m => m.is_vegan);
                if (vegan.length > 0) candidates = vegan;
            } else if (member.taste_leaning === 'meat_heavy') {
                const meat = candidates.filter(m => !m.is_vegan && m.macros.protein_g > 30);
                if (meat.length > 0) candidates = meat;
            }

            // Ensure >= 40% Budget/Standard across all. 
            // We just heavily bias picking from budget/standard by default, then occasionally mix premium.
            const usePremium = Math.random() > 0.6; 
            if (usePremium && premiumMeals.length > 0) {
                candidates = [...premiumMeals, ...candidates]; // Push premium to front
            }

            if (candidates.length === 0) {
                candidates = allMeals;
            }

            // Pick a random candidate
            const pickedMeal = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Assign delivery slot: use member config or default to home
            let location: DeliveryLocation = "home";
            let timeSlot: DeliveryTimeSlot = "12:30";
            
            if (member.savedLocations && member.savedLocations.length > 0) {
                // For MVP starter week, we just use the first defined location/time block for the layout
                const block = member.savedLocations[0];
                location = block.tag;
                timeSlot = block.timeSlot;
            }

            day.meals.push({
                plannedMealId: generateId(),
                meal: pickedMeal,
                familyMemberId: member.id,
                delivery: { location, timeSlot }
            });
        });
        
        results.push(day);
    });

    return results;
}
