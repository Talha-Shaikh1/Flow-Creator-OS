# FlowCreator OS — Complete Project Overview

## 1. What This Is

FlowCreator OS is a **standalone personal venture** — not a client-facing SaaS, not tied to Botaura. The goal: create AI video content (short-form, object-talking / character-drama style) at scale, for the founder's own channel(s), without the manual grind of daily idea-hunting and prompt-writing.

**Core Identity:** Not a "text-to-video prompt generator." It's positioned as an **Autonomous Production & Directing Operating System** — a "director" layer sitting on top of Google Flow (Veo). It never generates the actual image/video itself — it outputs prompts, dialogue, and reference-frame instructions, and the user generates on Flow manually.

---

## 2. The Problem It Solves

- Finding a fresh video idea every single day is slow and mentally draining
- Google Flow only generates 10-second clips — stitching multiple clips into one 30–60s video breaks character consistency unless every clip's reference frame/character description is handled carefully
- When two characters both have dialogue in one clip, Flow tends to make one character (usually the "main" one) speak both lines instead of correctly isolating each speaker
- A single story can span multiple distinct locations (home → office), which breaks naive "chain the last frame" continuity tricks
- Managing a whole cast (hero, villain, parents, siblings, rivals) across a multi-episode series needs consistency tools far beyond a single character reference

---

## 3. Core Product Principles

- **User never touches backend logic** — only selects options (100% checkbox/multi-select UI, no free typing) and judges the finished output
- **Every output must feel "ready to use,"** never a raw AI draft
- **Prompt quality is the product** — everything else (tracking, learning, trend intelligence) is optimization layered on top, and must not be built before the core is reliable
- **Zero-Friction Clipboard UX** — clip-by-clip one-click copy buttons and sequenced execution cards so manual generation in Google Flow is completely seamless
- **Strict Schema Enforcement** — prompt outputs are strictly validated via typed schemas (e.g. Zod) to guarantee formatting, timing tags, and speaker markers never drift

---

## 4. The Three Foundational Pillars

Every generated prompt must satisfy all three simultaneously:

1. **Spatial Geometry / Master Frame Anchor** (visual consistency)
   - Keyframe lock, screen-left/right blocking, lighting consistency, character DNA lock
   - Anchors are per-scene/location, not one single chain across an entire video

2. **Temporal Choreography / Strict Speaker Isolation** (multi-character dialogue accuracy)
   - Sec-by-sec breakdown, camera focus tied to the active speaker, explicit silence tags for everyone else in frame
   - Hard rule: never two speaking characters in the same 10s clip without a mid-clip camera cut (shot-reverse-shot style)

3. **Retention Dynamics / Psychological Hooks** (audience retention)
   - 0–3s visual-contrast opener, 18–22 word dialogue pacing, daily tension arcs, cliffhanger endings

---

## 5. Two-Layer Content Philosophy

- **Layer 1 — Story Core (evergreen, psychological):** the actual emotional content — sibling rivalry, betrayal, family conflict, underdog arcs. Relatable to human nature, doesn't go stale. Never trend-chased.
- **Layer 2 — Delivery Wrapper (trend-aware, updates over time):** hook style, pacing/editing pattern, format structure — whatever is currently working on the platform. This layer adapts; Layer 1 doesn't.
- Trend adoption means copying a viral video's **structure/skeleton** (shot pattern, hook timing, twist-reveal timing) — never its specific dialogue or a real person's likeness. The user's own original AI character + freshly generated story go inside that structure.

---

## 6. User Journey (Input Flow)

All single/multi-select, zero free text:
1. **Content Format** — Object-Talking / Character-Drama / Podcast-Style / Faceless-Ambient
2. **Genre/Theme** (multi-select) — Family Drama, Revenge, Romance, Comedy, Rivalry, Redemption, Mystery, Motivational
3. **Tone** — Emotional/Heavy, Light/Fun, Intense, Inspirational
4. **Cast Setup** — character count, roles (Hero/Villain/Side/Narrator), visual style preset
5. **Format Length** — single video or series (+ episode count)

→ Produces a structured, machine-readable **"story spec"** — pre-tagged for the learning loop later.

**Weekly delivery model:** a full week of content generated at once — each day carries a different emotion (following a deliberate weekly tension arc, not random), with **3 variations per day** so the user just picks, doesn't create from scratch. The user's pick is itself a usable signal before any published-performance data even exists.

---

## 7. Output Package (what the user receives)

Adapts by format — no irrelevant fields shown:
- Character/frame reference prompts (per character **and** per location, format-adaptive)
- Per-clip video prompts (scene, camera, positioning, continuity lock, sec-by-sec action, speaker isolation, pacing, hook)
- Speaker-isolated dialogue script (or voiceover + on-screen captions for Faceless/Ambient)
- **1-Click Clip Cards**: Clean visual cards with dedicated single-click copy buttons for prompt text, dialogue, and reference links formatted specifically for Flow's input boxes
- Metadata: caption, hashtags, title

---

## 8. Loop Engineering — What It Actually Means Here

Two possible loops were considered; only one is being built for now:

- **Built now — Prompt-Quality Self-Critique & Validation Loop (text-only):**
  Draft → Schema Validation (strict structure, timing, & speaker checks via Zod) → Critique (against a hard checklist + category-specific Format/Genre/Tone guides, composed modularly rather than one guide per every combination) → Refine → repeat 2–3 rounds → final polished output. Catches formatting drift, weak hooks, or ambiguous prompts before they ever reach the user.

- **Deferred — Visual/Output QC Loop:**
  Would require the user to re-upload the generated video for the platform to inspect against the reference. Rejected for now as too resource-intensive/inconvenient; the OAuth-based performance-tracking approach (Phase 2/3) covers the "does this actually work" question at a lighter weight instead.

---

## 9. Backend Systems (invisible to the user)

- **Auto-tagging** — hook type, core emotion/theme, pacing style, character setup, setting count — derived directly from the Step 1–5 selections (no separate inference pass)
- **Publishing link & performance tracking** — one-time read-only OAuth to Instagram/TikTok; matches published videos to story specs by account + time-window (one-tap confirmation if ambiguous); auto-fetches views, likes, comments, shares, watch-time, saves
- **Learning loop** — real-time, recency-weighted scoring per tag (not periodic retraining); high-scoring tags get more weight in future generation, while variety is deliberately preserved so output doesn't converge into sameness
- **Series Continuity Memory** — after each episode, auto-saves a structured summary (characters, plot points, unresolved threads); next episode's generation pulls this automatically
- **Trend/Timing Intelligence** — posting-time suggestions per category, plus (Phase 4) a curated trend-structure feed matched to the user's niche

---

## 10. Development Phases — What Each One Covers

| Phase | Covers | Why it's positioned there |
|---|---|---|
| **Phase 1 — Core MVP: Prompt Engine & Fast UX** | Input UI (100% select), story spec system, character/reference/continuity-lock system, speaker isolation logic, modular prompt template engine (all 4 formats), Zod schema validation & self-critique loop, hard quality gate, 1-click clipboard clip cards, weekly-batch output delivery | This IS the product. Nothing else matters if speaker isolation, character consistency, and copying to Flow aren't rock-solid and effortless. Must be manually validated on real generated stories before moving on. |
| **Phase 2 — Publishing Link & Tracking Foundation** | OAuth connection, video-to-prompt matching, auto-tagging bookkeeping, performance data fetch pipeline | Platform starts collecting the data it will need to learn from — but doesn't act on it yet. |
| **Phase 3 — Learning Loop** | Rolling/weighted tag scoring, feeding high-performers back into generation (with variety preserved), Series Continuity Memory | This is the actual "self-improving" differentiator — but only meaningful once Phase 1 output is trustworthy and Phase 2 has real data flowing in. |
| **Phase 4 — Intelligence & Polish** | Trend/timing intelligence (structure-adoption, not content-cloning), fatigue/repetition detector, UI/UX polish | Platform matures from functional to best-in-class; explicitly the last priority. |

---

## 11. Key Decisions Made Along the Way (and why)

- **Standalone personal tool, not a SaaS** — scope stays founder-sized, no multi-tenant complexity yet
- **Text-only output, no image/video generation in-house** — keeps infrastructure light; user always generates on Flow directly
- **Modular & Configurable Prompt Templates** — prompt structures and Veo syntax rules are decoupled and configurable, so future Google Flow updates don't break the codebase
- **Strict Schema Validation (Zod / Typed JSON)** — prevents LLM hallucination and structural drift in multi-clip timing and speaker tagging
- **1-Click Clip Cards UI** — minimizes manual friction when moving prompts clip-by-clip into Google Flow
- **Scene-based (not whole-video) continuity anchoring** — because stories legitimately span multiple locations
- **Shot-reverse-shot rule for multi-character dialogue** — the direct fix for Flow's known "one character speaks both lines" bug
- **"Trending" reframed as structure-adoption, not content-cloning** — avoids copyright/platform-policy risk while still capturing what makes viral content work
- **Visual QC loop deferred in favor of lighter OAuth-based tracking** — same "does it actually work" goal, far less engineering cost
- **Modular category guides (per Format/Genre/Tone), composed at generation time** — avoids having to hand-write rules for every Format×Genre×Tone combination
