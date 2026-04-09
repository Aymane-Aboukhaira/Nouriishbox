# The Nourishbox Complete Architecture & UX Spec (Context for Claude)

**Date:** March 2026
**Project Name:** Nourishbox
**Core Identity:** A premium, bespoke nutrition delivery SaaS based in Tanger, Morocco.

This document serves as the absolute source of truth for the Nourishbox front-end architecture. It vividly describes exactly what the application looks like, how it behaves, its state management layer, and its complete feature set, precisely as if you were navigating it with your own eyes.

---

## 🎨 1. The Visual Identity & Design System
Nourishbox does not look like generic SaaS—it feels organic, natural, flowing, and premium.
- **Backgrounds:** The app entirely avoids stark white or dark themes. The global background is a warm Cream (`#FFF8F4`). Panels use pure white (`#FFFFFF`) or very subtle green/orange tints.
- **Color Palette:**
  - **Mint (Primary):** `#6BC4A0` — Used for active states, CTAs, and primary "healthy" badges. 
  - **Lavender (Secondary):** `#B09AE0` — Calm, restorative tone used for Protein macros and select highlights.
  - **Peach (Accent):** `#FFA07A` — Warm, energetic tone used for Fats macros and warnings.
  - **Gold (Accent):** `#F59E0B` — Used for Calories, star ratings, and "Great Match" badges.
  - **Text:** Dark Charcoal (`#2D2D2D`) for primary text to reduce eye strain, and muted gray (`#9C9C9C` or `#6B6B6B`) for secondary text.
- **Typography:** `DM Serif Display` is used for all major headings, offering an elegant, editorial feel. `Nunito` is used for body text, providing round, highly legible sans-serif readability.
- **Shapes & Shadows:** Sharp corners do not exist in Nourishbox. Cards, buttons, and panels use `rounded-2xl` (24px) or `rounded-3xl` (32px). Depth is created using very soft, floating shadows (e.g., `shadow-[0_12px_40px_rgba(45,45,45,0.06)]`). Everything feels like it's hovering smoothly on the page.
- **Motion:** Heavy usage of `framer-motion`. Page transitions slide smoothly. Lists populate with staggers. Important numbers and rings animate sequentially. Buttons have `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}` tactile feedback.

---

## 🏗️ 2. Tech Stack & Frontend "Backend"
The project is built entirely on the frontend with **Next.js 14 (App Router)** and **TypeScript (Strict, Zero Errors)**. Because there is no real backend API yet, the application simulates an entire database locally.

**The Zustand Persistence Layer (`lib/store.ts`)**:
The app relies on 8 independent, deeply typed Zustand stores, wrapped in the `persist` middleware to save state perfectly to `localStorage`. A user can refresh the page at any time without losing any data.
1. `useProfileStore`: Holds the user's demographic data (age, gender, weight, height), goals, and dynamically calculated macro targets.
2. `useMealsStore`: The master menu catalog. Contains 30+ highly detailed mock meal objects (images, ingredients, kcal, exact macros, allergens).
3. `usePlannerStore`: Manages the 7-day layout. Tracks which meal is assigned to which day, and tracks specifically "paused" delivery days.
4. `useFamilyStore`: Array of family member profiles and their specific meal assignments.
5. `useOrdersStore`: Tracks the exact lifecycle Kanban stage of active orders.
6. `useSubscriptionStore`: Booleans for active/paused states and the selected billing plan (Solo, Couple, Family).
7. `usePointsStore`: Gamification ledger holding current NourishPoints, streak counts, and history.
8. `useClinicStore`: Array of message objects (sender, text, timestamp) acting as the chat history for the AI Virtual Clinic.

---

## 🚀 3. The Public Funnel (Unauthenticated)

### 📌 The Landing Page (`/`)
*The first touchpoint for a cold visitor. Highly animated.*
- **Sticky Navbar:** Fades from transparent to a frosted-glass Cream background on scroll. Contains a "Get my plan" CTA that conditionally scales in using Framer Motion when you scroll 80px down.
- **Hero Section:** Features the bold headline *"Nutrition built for you, delivered to your door"*. The words stagger into view one by one. Smooth organic background blobs slowly warp behind the text. Below it, a social proof strip shows stacked user avatars and "1,200+ members nourished this week."
- **How It Works:** 3 large cards with massive pastel numbers spilling out of their containers. They slide up via `whileInView` interactions.
- **Macro Science:** A dark-themed educational section. It houses three liquid SVG rings (`MacroBlob` components) illustrating strict 30% Protein, 45% Carbs, and 25% Fats splits.
- **Meal Preview:** A dynamically mapped masonry grid of the top 6 meals directly from `useMealsStore`, utilizing the main `MealCard` component so it feels like the real product.
- **Pricing & Checkout:** 3 column pricing representing MAD (Moroccan Dirham). The "Couple" plan is elevated with a Mint border, a "Most Popular" badge, and an active shadow. 

### 🧗 The Onboarding Wizard (`/onboarding`)
*A 6-step data collection flow.*
- Exclusively uses Client Components with `AnimatePresence` so every step slides horizontally in/out. 
- Form state is managed with `react-hook-form` and rigorously typed via `zod`.
- **Thumb-Zone UI:** No tiny radio buttons or native dropdowns. Users tap massive, chunky `rounded-2xl` tiles to select Activity Levels and Goals. Fixed navigation sits cleanly at the bottom of the phone screen.
- **The Nutrition Engine:** On completion, the wizard internally runs the exact **Mifflin-St Jeor equation**, accounts for male/female constants, multiplies by the localized activity index, applies a caloric deficit/surplus based on the goal, and splits macros perfectly.

### 🎁 The Personalised Reveal Screen (`/onboarding/reveal`)
*The emotional climax. The user sees their custom diet.*
- Includes a strict hydration guard (`hasMounted`) to prevent SSR flashes.
- **Animated Entrance:** A mint pill reading "Your plan is ready" pops in, followed by a personalized headline: *"Here's what we built for you, [Name]"*.
- **The Macro Summary Card (Centerpiece):** A massive elevated white card. Inside, 4 SVG rings (Calories, Protein, Carbs, Fats) animate their `pathLength` from 0 to precisely their percentage of the user's diet. They don't load simultaneously—they stagger sequentially across 1.5 seconds.
- **Insight Strip:** 3 horizontal scrolling pills breaking down the math: e.g., "Goal: Lose weight", "140g protein = ~4 chicken breasts".
- **Matched Meals Algorithm:** Scans the `useMealsStore`. Calculates absolute variance between the user's per-meal targets and the actual meal macros. Renders the top 3 best fits with dynamic badges: Mint ("Perfect match") or Gold ("Great match").
- **Sticky Mobile Navigation:** A beautiful bottom bar glued to the viewport (via CSS `sticky`, circumventing iframe viewport issues) summarizing the chosen tier and a "Continue to Checkout" button.

---

## 📱 4. The Client Dashboard (Authenticated)
*The daily operational hub for the user.*

### 🏠 Dashboard (`/client/dashboard`)
- Uses simulated 800ms loading states (`animate-pulse` skeletons) to mimic network latency for premium perception.
- **Top Row:** 4 interactive `MacroBlob` liquid rings visualizing consumed vs. target macros for the day.
- **Today's Meals:** A clean vertical checklist. Clicking "Eat" updates the macro rings instantly.
- **Streak Widget:** Renders an SVG plant component that visually upgrades (from seed → sprout → sapling → tree) as the user's daily streak increases.

### 🍽️ Menu Discovery (`/client/menu`)
- Upgraded to a "Guided Discovery" engine that feels like a nutritionist handing you a curated list.
- Calculates `"Built for you today"` recommendations instantly against the user's computed remaining macros.
- Features absolute-positioned Macro Match Score pills on all meals.
- The "Fix my macros" exclusive filter sorts by highest macro fit and dims standard categories.
- Includes a floating exact-positioning `Quick-Add Popover` to drop meals into specific planner days.
- Clicking a card opens a massive bottom sliding drawer with dynamic macro progress bars, ingredients, allergens, and past ratings.

### 📅 Weekly Planner (`/client/planner`)
- A horizontal Kanban board spanning Monday to Sunday, powered by `@dnd-kit/core`.
- Pointers are cleanly decoupled to allow Framer Motion animations inside Draggable targets.
- A sticky robust "Quick-Add Drawer" acts as a hub to search and instantly copy meals to precise days using absolute `dayKey` strings.
- Features a powerful "Replan Week" engine: users can hit a wand icon to preview an entirely new week based on 3 strategies (Balanced, Variety, Repeat) and apply it to their global Zustand store to win NourishPoints.

### 👨‍👩‍👧‍👦 Family Hub (`/client/family`)
- Profile switching UI (like Netflix) to jump between dependents.
- Includes a Zod-validated "Add Member" modal. Admins can route specific meals to specific family members via `useFamilyStore`.

### 📊 Analytics (`/client/analytics`)
- Imports `Recharts`.
- Line charts tracking a 30-day continuous history of Protein/Carbs/Fats adherence.
- A 28-cell CSS grid acting as a "GitHub-style heatmap" colored by macro adherence percentage (dark mint = 100%, light cream = 0%).

### 🩺 Virtual Clinic (`/client/clinic`)
- A chat interface wrapping the `useClinicStore`.
- When the user types, the UI renders an AI `ChatBubble` with a bounce-animating 3-dot typing indicator.
- Utilizing chained `setTimeout` promises, the AI simulates "thinking" for 600ms before returning a predefined response matched via regex to keywords like "hungry", "energy", or "bloated".

---

## ⚙️ 5. The Admin Portal (Staff view)
*Operational tools for Nourishbox staff.*

- **Dashboard (`/admin/dashboard`):** Real-time KPI cards reflecting Moroccan Dirham (e.g., "124,500 MAD MRR") and historical Recharts metrics. 
- **Menu Builder (`/admin/menu`):** Data table for all `Menu` arrays. An "Add Meal" modal allows staff to dictate macros, image URLs, and allergens natively into the global Zustand store.
- **Order Management (`/admin/orders`):** Another `@dnd-kit/core` Kanban board, replacing days with fulfillment stages (Pending, Preparing, Out for Delivery, Delivered). Draging an order updates the global state.
- **User Management (`/admin/users`):** A directory of subscribers with direct action buttons allowing admins to force-pause or cancel client subscriptions remotely.

---

## 🛠️ 6. Universal Components
- **`MacroBlob`:** An SVG progress ring component taking `percentage, color, label`. Handles its own mounting animation.
- **`MealCard`:** The atomic unit of the UI. Highly versatile. Reused in the preview grid, the menu, the planner, and the admin system. Features badging, large rounded image wrappers, bold typography, and direct `usePlannerStore` integration buttons.
- **`Skeleton` Framework:** Native Tailwind `animate-pulse` blocks sculpted to perfectly match the dimensions of the items they precede, avoiding layout shift entirely.

This ecosystem is totally robust, strongly typed throughout all interactions, entirely self-contained, and ready to evolve directly into network-based logic.
