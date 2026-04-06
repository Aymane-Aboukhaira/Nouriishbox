// ============================================================
// NOURISHBOX — Taste Preference Filter & Boost Utilities
// ============================================================
import type { Meal, TastePreferences } from './types';

/**
 * Returns true if the meal should be HIDDEN based on the user's taste preferences.
 * Checks ingredients, tags, and spice tolerance.
 */
export function isMealExcludedByTaste(meal: Meal, prefs: TastePreferences): boolean {
    if (!prefs || prefs.dislikes.length === 0 && prefs.spiceTolerance !== 'none') {
        return false;
    }

    const dislikeSet = new Set(prefs.dislikes.map(d => d.toLowerCase()));

    // Check ingredients array (case-insensitive)
    if (meal.ingredients?.some(ing => dislikeSet.has(ing.toLowerCase()))) return true;

    // Check tags array (case-insensitive) — e.g. user dislikes "seafood" and meal has "seafood" tag
    if (meal.tags.some(tag => dislikeSet.has(tag.toLowerCase()))) return true;

    // Spice tolerance filter
    if (prefs.spiceTolerance === 'none' && meal.tags.some(t => t.toLowerCase() === 'spicy')) return true;

    return false;
}

/**
 * Returns a score bonus (+10) if the meal aligns with the user's dietary leaning.
 */
export function getDietBoost(meal: Meal, prefs: TastePreferences): number {
    if (!prefs) return 0;

    switch (prefs.dietLeaning) {
        case 'pescatarian':
            return meal.tags.some(t => t.toLowerCase() === 'seafood') ? 10 : 0;
        case 'plant_based':
            return meal.tags.some(t => ['vegan', 'vegetarian'].includes(t.toLowerCase())) ? 10 : 0;
        case 'meat_heavy':
            return meal.tags.some(t => ['beef', 'chicken'].includes(t.toLowerCase())) ? 10 : 0;
        default:
            return 0;
    }
}
