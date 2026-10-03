---
name: creative-ui
description: >-
  World-Class Creative UI & Anti-Generic Frontend Craftsmanship System.
  Use whenever designing, conceptualizing, building, or styling web user interfaces, interactive components,
  visual aesthetics, layouts, design tokens, typography, and micro-interactions. Eliminates repetitive,
  cookie-cutter AI slop (generic purple gradients, unconsidered 100px pills, washed-out blur cards)
  with expressive, editorial-grade, tactile digital craftsmanship inspired by Teenage Engineering,
  Stripe Press, Pentagram, Linear 2.0, and Swiss International Style.
---

# Creative UI: The Grandmaster Frontend Craftsmanship System

Modern AI coding assistants default to a predictable, sterile visual monoculture: purple/indigo gradients, floating glassmorphic blur blobs, rounded 9999px pills, and low-contrast grey text. This is **"AI Slop"**.

This skill provides the architectural principles, aesthetic archetypes, mathematical tokens, and tactile component patterns required to build creative, unforgettable web interfaces with the physical presence of precision hardware and the typographic authority of high-end editorial design.

---

## 1. The 8 Cardinal Sins of "AI Generic" Design (Zero Tolerance)

Whenever auditing or generating CSS, HTML, or component styling, strictly eradicate these 8 clichés:

| Cliché | Why It Fails | What to Build Instead |
| :--- | :--- | :--- |
| **1. The Purple/Indigo Gradient Card** | `linear-gradient(135deg, #6366f1, #a855f7)` screams boilerplate template. | Confident solid pigment surfaces, directional physical elevation, top specular highlights (`inset 0 1px 0 rgba(255,255,255,0.1)`). |
| **2. The Meaningless Frosted Glass Sprawl** | `backdrop-filter: blur(16px)` on every static card creates muddy contrast and composite lag. | Solid, architecturally layered obsidian planes (`#0c0e14`, `#141722`, `#1c2130`). Reserve blur strictly for floating sticky navbars and modal scrims. |
| **3. The Universal 100px Pill Button** | `border-radius: 9999px` on action buttons and cards feels juvenile and plastic. | Proportionate architectural radii: `4px` (micro badges), `6px` (inputs/tool buttons), `8px` (primary CTAs), `12px` (workstation panels). |
| **4. The Muddy Grey Text Syndrome** | `#64748b` or `#94a3b8` body copy on dark backgrounds fails WCAG AA contrast. | High-contrast optical hierarchy: `#f8fafc` (98% contrast titles), `#e2e8f0` (88% body), `#94a3b8` (secondary metadata). |
| **5. Gratuitous Gradient Text Clipping** | Splashing `background-clip: text` across normal headings makes text illegible. | Crisp, punchy solid typography with optical kerning (`letter-spacing: -0.04em`) and purposeful weight contrast. |
| **6. The Floating Colored Fog Blob** | Floating amorphous radial gradient balls (`radial-gradient(circle, rgba(...))`) behind content. | Crisp structural grid lines, fine hairline dividers, or intentional noise-textured matte planes. |
| **7. The Flat, Zero-Feedback Button** | Hover states that only change opacity or trigger continuous pulsating scales. | Mechanical tactile depression: `transform: translateY(1.5px)` on active press, top-edge specular line, shadow deflation. |
| **8. The Unconsidered Font Default** | Falling back to generic browser fonts without tabular figures or typographic rhythm. | Pairing expressive display headings with high-legibility monospace tabular figures for technical readouts. |

---

## 2. The Three Creative Design Archetypes

Choose one distinct design personality per product and execute it with ruthless consistency:

### Archetype A: Precision Hardware & Industrial Instrument
*Inspired by Teenage Engineering (OP-1 / Field system), Dieter Rams (Braun), Elektron, and flight instruments.*

- **Atmosphere**: Utilitarian, tactile, surgical, physical. Feels like an expensive aluminum hardware tool.
- **Palette**:
  - Canvas: `#0b0d11` (Deep Carbon)
  - Surface 1: `#12151c` (Matte Workstation Bay)
  - Surface 2: `#1a1e28` (Milled Aluminum Tile)
  - Accent Signal: `#f97316` (Safety Orange) or `#eab308` (Amber CRT) or `#22c55e` (Terminal Phosphor)
  - Hairlines: `1px solid rgba(255, 255, 255, 0.08)`
- **Tactile Traits**:
  - Technical metadata stamps: `[CH-01 // READY]`, `SAMPLE_RATE: 48kHz`, `IO: ACTIVE`.
  - Machine-etched tick marks and ruler indicators beside sliders.
  - Recessed control trays with inset shadows (`box-shadow: inset 0 2px 4px rgba(0,0,0,0.6)`).
  - Mechanical toggles with dual-state LED status pips.

### Archetype B: High-Contrast Swiss & Editorial Brutalism
*Inspired by Pentagram, Swiss International Style, Readymag, Stripe Press, and Massimo Vignelli.*

- **Atmosphere**: Confident, stark, authoritative, typography-first.
- **Palette**:
  - Canvas: Pure `#ffffff` (light) or Deep Pitch `#050505` (dark)
  - Contrast: Pure `#000000` (light) or Optical `#f8f8f8` (dark)
  - Accent: High-energy Signal Red (`#e11d48`) or International Klein Blue (`#002fa7`)
  - Lines: Razor-sharp 1px high-contrast structural borders (`rgba(0,0,0,0.15)` or `rgba(255,255,255,0.2)`)
- **Tactile Traits**:
  - Massive typographic scale jumps: 72px headline directly paired with 11px uppercase technical captions.
  - Strict modular column grids with visible ruled borders (newspaper style).
  - Bold, oversized numeric indexes: `01 / SELECT`, `02 / ENCODE`, `03 / EXPORT`.
  - Zero decorative fluff; every pixel serves communication.

### Archetype C: Warm Organic Craftsmanship
*Inspired by Craft.do, Kinfolk, Stripe Climate, Arc, and luxury print publishing.*

- **Atmosphere**: Sophisticated, tactile, human, serene.
- **Palette**:
  - Canvas: Warm Oatmeal Parchment `#f9f8f5` (light) or Smoked Obsidian `#141413` (dark)
  - Surfaces: Muted Sand `#efeee9` / Raw Charcoal `#1f1f1d`
  - Accent: Burnt Terracotta (`#c25e38`) or Botanical Sage (`#3f624d`)
  - Lines: Warm hairline rules (`rgba(40, 36, 32, 0.08)` or `rgba(240, 235, 225, 0.1)`)
- **Tactile Traits**:
  - Elegant serif or humanistic grotesque display headings.
  - Subtle paper grain or deckle-edge divider accents.
  - Soft, expansive ambient occlusion shadows with warm amber undertones.

---

## 3. Typographic Hierarchy & The Golden Rules of Scale

A creative design lives or dies by its typographic contrast. Never set your heading at 32px and your body at 16px—that is the signature of boilerplate AI.

### The Scale Jump Formula
1. **Hero Title (The Anchor)**: `clamp(2.75rem, 5.5vw, 4.5rem)`
   - `letter-spacing: -0.04em`
   - `line-height: 1.08`
   - `font-weight: 700` or `800`
2. **Section Lead (The Argument)**: `clamp(1.15rem, 2vw, 1.35rem)`
   - `letter-spacing: -0.015em`
   - `line-height: 1.55`
   - `color: var(--text-secondary)` (85% contrast)
3. **Control / Field Label**: `0.8125rem` (13px)
   - `font-weight: 600`
   - `letter-spacing: -0.01em`
4. **Technical Metadata / Status Pip**: `0.6875rem` (11px)
   - `font-family: var(--font-mono)`
   - `text-transform: uppercase`
   - `letter-spacing: +0.08em`
   - `font-weight: 600`

### Mandatory Tabular Figures
Always apply `font-variant-numeric: tabular-nums` to numbers, file sizes, percentages, progress bars, coordinates, and timers. This prevents visual jitter when values update in real time.

---

## 4. Mechanical Tactile Physics (The "Feel" of Quality)

To make a web app feel premium, buttons and interactive controls must respond like calibrated physical switches:

```css
/* The Physical Precision Button */
.button-tactile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  border-radius: 8px;
  background: var(--bg-surface-3);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  
  /* Physical Bevel: Top Specular Highlight + Directional Base Shadow */
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 4px 12px -2px rgba(0, 0, 0, 0.3);
  
  cursor: pointer;
  user-select: none;
  transition: 
    background-color 140ms ease,
    border-color 140ms ease,
    transform 100ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 100ms cubic-bezier(0.16, 1, 0.3, 1);
}

.button-tactile:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-hover);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 2px 4px rgba(0, 0, 0, 0.45),
    0 6px 16px -2px rgba(0, 0, 0, 0.35);
}

/* Mechanical Press: Physical Depression */
.button-tactile:active {
  transform: translateY(1.5px);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.5),
    0 0 2px rgba(0, 0, 0, 0.3);
}

.button-tactile:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--bg-canvas),
    0 0 0 4px var(--accent-focus);
}
```

---

## 5. Architectural Surface Layering (The 4-Plane System)

Never stack cards randomly on top of each other. Build depth through a deliberate 4-plane elevation system:

```css
:root {
  /* Plane 0: Base Canvas (Deepest Background) */
  --bg-canvas: #090a0f;

  /* Plane 1: Workstation Chassis / Sticky Nav Shell */
  --bg-surface-1: #11131a;

  /* Plane 2: Main Cards, Workstation Trays, Content Enclosures */
  --bg-surface-2: #171b26;

  /* Plane 3: Elevated Control Surfaces, Inputs, Dropzones, Action Tiles */
  --bg-surface-3: #1f2433;
  --bg-surface-hover: #262d40;
  --bg-surface-active: #2e364d;

  /* Precision Hairline Borders */
  --border-subtle: 1px solid rgba(255, 255, 255, 0.05);
  --border-default: 1px solid rgba(255, 255, 255, 0.09);
  --border-hover: 1px solid rgba(255, 255, 255, 0.18);
  --border-active: 1px solid rgba(255, 255, 255, 0.30);

  /* Directional Ambient Occlusion Shadows */
  --shadow-recessed: inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(0, 0, 0, 0.4);
  --shadow-flat: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --shadow-elevated: 0 4px 16px -2px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --shadow-floating: 0 16px 40px -6px rgba(0, 0, 0, 0.75), 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
```

---

## 6. Layout Choreography: Breaking the 3-Box Grid

Standard AI creates 3 identical cards in a row. A master designer creates **rhythmic tension**:

1. **The Anchor Bento**:
   - 1 dominant 60% card (interactive hero action or primary control surface).
   - 2 stacked 40% telemetry cards (live statistics, technical parameters, format diagnostics).
2. **The Status Ribbon**:
   - A slim, full-width or inline telemetry strip with micro status LEDs (`● ONLINE // HARDWARE_ACCELERATED // 0 BUGS`).
3. **Corner Notch Detailing (Industrial Motif)**:
   - Use subtle pseudo-elements (`::before` / `::after`) to render technical corner bracket accents (`+` or `L` markers) on dropzones and hero enclosures.
4. **Interactive Scrubbers & Split Views**:
   - Instead of static before/after images, build draggable physical slider curtains with knurled drag thumbs and real-time delta badges (`-78.4% SAVED`).

---

## 7. Execution Checklist Before Shipping Any UI

Before concluding any visual design or frontend styling task, ask:

- [ ] **Does this look like an AI made it?** (If it has a purple-to-blue gradient button or washed-out glassmorphism blur, immediately refactor).
- [ ] **Is the typography commanding?** (Did you establish a massive contrast jump between headline and micro-captions?).
- [ ] **Are numeric readouts tabular?** (Is `tabular-nums` applied to prevent UI jumping?).
- [ ] **Do buttons have mechanical feedback?** (Do they depress physically with `transform: translateY` on active press?).
- [ ] **Is the contrast compliant?** (Are all text labels passing WCAG AA against their background surface?).
- [ ] **Is there a coherent design archetype?** (Did you deliberately choose Industrial Instrument, Swiss Editorial, or Warm Craft, and adhere to it strictly?).
