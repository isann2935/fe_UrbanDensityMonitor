# Design System: Urban Density Monitor
**Project ID:** yiwzijdgaadfavsvaxsp

## 1. Visual Theme & Atmosphere
The design embraces a modern **Supabase-inspired Developer-Tool & Infrastructure Dashboard** aesthetic. It is defined by an ultra-clean, high-contrast dark environment where pure deep dark backgrounds (`#0A0A0A` and `#171717`) are paired with high-vibrancy *Supabase Emerald Mint* (`#3ECF8E`) as the primary interactive anchor. The mood is utilitarian, crisp, and high-tech, reinforced by subtle translucent glass borders (`rgba(255,255,255,0.08)`), micro-dot canvas textures (`48px grid`), monospace metric telemetries, and restrained, high-performance micro-interactions that elevate data density while avoiding visual clutter.

## 2. Color Palette & Roles
* **Base Background (`#0A0A0A`):** Root canvas layer, establishing deep dark mode contrast for the entire application.
* **Sidebar Background (`#111111`):** Distinct navigation panel layer providing structural grounding on the left flank.
* **Card & Container Background (`#171717`):** Elevated surface layer for telemetry cards, video panels, and interactive grids.
* **Surface Hover / Active Item (`#1F1F1F` / `rgba(255, 255, 255, 0.04)`):** Highlight state for interactive rows, dropdown options, and inactive button states.
* **Translucent Border (`rgba(255, 255, 255, 0.08)`):** Floating card boundary that delivers a clean glassmorphic divider without solid harshness.
* **Subtle Border (`rgba(255, 255, 255, 0.05)`):** Low-contrast dividers inside tables, toolbars, and nested data splits.
* **Primary Accent — Mint Green (`#3ECF8E`):** Supabase signature emerald brand color for primary CTAs, active indicators, live telemetry dots, and key highlights.
* **Accent Hover (`#34B87C`):** Darker mint shade used for hover and active interactive states on primary buttons.
* **Accent Muted (`rgba(62, 207, 142, 0.10)`):** Soft glow background for badge containers, active navigation pills, and iconography backdrops.
* **Primary Text (`#FFFFFF`):** High-contrast pure white for headings, critical metric values, and active labels.
* **Secondary Text (`#8B949E`):** Refined muted slate/gray for subtitles, secondary metrics, field labels, and descriptions.
* **Status Success (`#34D399` / `#3ECF8E`):** Indicator for active CCTV feeds, 100% success rate, and healthy telemetry.
* **Status Warning (`#FBBF24`):** Amber tone for medium traffic density, high memory usage, and caution alerts.
* **Status Danger (`#F87171`):** Vivid red for high traffic congestion, connection drops, and anomaly alerts.
* **Status Info (`#60A5FA`):** Soft blue for informative notices, model inference parameters, and metadata tags.

## 3. Typography Rules
* **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` for all UI text, headings, and controls.
* **Monospace Font Family:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` for API endpoints, coordinate latencies, timestamps, FPS counters, and ML inference logs.
* **Header Hierarchy & Weights:**
  * **Project & Page Headings:** `text-2xl` to `text-3xl` (`24px`–`30px`), `font-bold` (700 weight), using tight tracking (`tracking-tight`) with `#FFFFFF`.
  * **Section & Component Headings:** `text-lg` to `text-xl` (`18px`–`20px`), `font-semibold` / `font-bold` (600–700 weight), `#FFFFFF`.
  * **Card & Stat Subtitles:** `text-xs` (`12px`) or `text-[10px]`, `font-semibold` (600 weight), uppercase with wider letter-spacing (`tracking-wider` / `tracking-widest`), paired with `#8B949E`.
* **Body & Paragraphs:** `text-sm` (`14px`) to `text-base` (`16px`), `font-normal` / `font-medium` (400–500 weight), `text-[#8B949E]`, with generous line-height (`leading-relaxed`).
* **Letter-Spacing Character:** Headings feature negative tracking (`-0.02em` / `tracking-tight`) for an editorial, modern tech feel, while metric labels, pill badges, and table headers use uppercase positive tracking (`+0.05em` to `+0.1em`).

## 4. Component Stylings
* **Buttons:**
  * *Primary CTA:* Rounded rectangle (`rounded-lg` / `8px`), background `#3ECF8E`, text `#000000` (font-semibold, 600 weight), padding `px-4 py-2` or `px-5 py-2.5`. On hover: transition to `#34B87C` with soft emerald focus ring / glow (`box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.2)`).
  * *Secondary CTA:* Rounded rectangle (`rounded-lg` / `8px`), translucent card background (`bg-[#171717]` or `bg-white/[0.04]`), border stroke `1px solid rgba(255, 255, 255, 0.08)`, text `#FFFFFF`. On hover: transition to `bg-white/[0.08]` and border `rgba(255, 255, 255, 0.16)`.
  * *Danger / Delete Button:* Rounded rectangle (`rounded-lg`), background `rgba(248, 113, 113, 0.15)`, text `#F87171`, border `rgba(248, 113, 113, 0.30)`. On hover: `bg-red-500/25`.
* **Cards/Containers:**
  * *Structure & Roundness:* Large container cards use `rounded-2xl` (`16px`), internal cards / stat blocks use `rounded-xl` (`12px`), and badges / chips use `rounded-lg` (`8px`).
  * *Background & Stroke:* Solid dark surface `#171717` framed with a crisp translucent glass stroke (`1px solid rgba(255, 255, 255, 0.08)`).
  * *Shadow & Depth:* Base state uses subtle ambient depth (`box-shadow: 0 1px 3px rgba(0,0,0,0.5)`). On hover (`.card-interactive`): smooth upward micro-lift (`translateY(-1px)`), translucent emerald border highlight (`rgba(62, 207, 142, 0.25)`), a 2px top gradient stripe (`.card-accent-stripe`), and deep elevation glow (`box-shadow: 0 0 0 1px rgba(62, 207, 142, 0.12), 0 8px 32px rgba(0, 0, 0, 0.5)`).
* **Inputs/Forms:**
  * *Stroke & Background:* Rounded rectangle (`rounded-lg` / `8px`), dark translucent surface `bg-white/[0.04]` or `bg-[#171717]`, with subtle border `1px solid rgba(255, 255, 255, 0.08)`.
  * *Typography & Placeholders:* Crisp white text `#FFFFFF` with muted placeholders `#8B949E` (opacity 50%).
  * *Focus Behavior:* Immediate border shift to `#3ECF8E` with a single-pixel accent ring (`ring-1 ring-[#3ECF8E]`) and zero default browser outline.

## 5. Layout Principles
* **Navigation & Framing:** Fixed 260px sidebar navigation on the left with a hairline translucent right border (`border-white/[0.06]`), coupled with a sticky top breadcrumb header bar with backdrop blur (`backdrop-blur-xl bg-[#0A0A0A]/80`).
* **Whitespace & Padding Strategy:** Generous external margins (`p-6` to `p-8`) combined with disciplined vertical pacing (`space-y-6` / `space-y-8`), giving complex real-time ML CCTV data breathing room.
* **Grid Alignment & Responsiveness:**
  * *Metric Summary Strip:* 4-column responsive grid (`grid-cols-2 md:grid-cols-4 gap-3` to `gap-4`).
  * *Live Stream Fleet:* 1 to 4 column responsive card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`).
  * *Interactive Canvas & Diagram Split:* 12-column responsive layout split (`lg:col-span-5` for status clusters and `lg:col-span-7` for live video / topology map canvas).
* **Atmospheric Canvas Texture:** Visual panels and dashboard backdrops incorporate a subtle dot-grid texture (`.bg-grid-subtle`, 48px tile interval with `rgba(62, 207, 142, 0.025)`), echoing developer console topologies and hardware monitoring screens.