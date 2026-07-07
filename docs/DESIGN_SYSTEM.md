# ShopMind Design System

## Design Philosophy

ShopMind is built on four core design principles:

### Voice-First
The primary interaction model is voice input. UI elements support and complement voice interactions rather than replace them. The recording button is the most prominent element on screen.

### Mobile-First
Designed for smartphone users in India operating small retail shops. Every screen is optimized for one-handed mobile use before scaling up to tablets or desktop.

### Low-Literacy Friendly
- Visual cues and icons supplement text
- Large, clear typography with high contrast
- Minimal text required for core workflows
- Audio feedback and confirmations
- Color-coded categories and status indicators

### Multilingual
- Support for Hindi, Telugu, and English
- Dynamic font loading based on detected language
- RTL-ready layout architecture
- Transliteration support for voice-to-text display

---

## Brand Identity

### Name
**ShopMind**

### Tagline
*"Your voice, your business, organized"*

### Logo Guidelines
> 🚧 **Placeholder** — Logo assets and usage guidelines to be finalized.
>
> - Primary logo: ShopMind wordmark with voice waveform icon
> - Minimum size: 32px height
> - Clear space: 1x height on all sides
> - Variations: Full color, monochrome, reversed

---

## Color Palette

### Primary Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `primary` | `#2563EB` | blue-600 | Trust, reliability — primary actions, links, focus states |
| `primary-light` | `#3B82F6` | blue-500 | Hover states |
| `primary-dark` | `#1D4ED8` | blue-700 | Active/pressed states |

### Secondary Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `secondary` | `#059669` | emerald-600 | Money, success — income, positive transactions |
| `secondary-light` | `#10B981` | emerald-500 | Hover states |
| `secondary-dark` | `#047857` | emerald-700 | Active/pressed states |

### Accent Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `accent` | `#D97706` | amber-600 | Alerts, attention — pending items, warnings |
| `accent-light` | `#F59E0B` | amber-500 | Hover states |
| `accent-dark` | `#B45309` | amber-700 | Active/pressed states |

### Neutral Colors (Slate Scale)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `neutral-50` | `#F8FAFC` | slate-50 | Page backgrounds (light mode) |
| `neutral-100` | `#F1F5F9` | slate-100 | Card backgrounds |
| `neutral-200` | `#E2E8F0` | slate-200 | Borders, dividers |
| `neutral-300` | `#CBD5E1` | slate-300 | Disabled states |
| `neutral-400` | `#94A3B8` | slate-400 | Placeholder text |
| `neutral-500` | `#64748B` | slate-500 | Secondary text |
| `neutral-600` | `#475569` | slate-600 | Body text |
| `neutral-700` | `#334155` | slate-700 | Headings |
| `neutral-800` | `#1E293B` | slate-800 | High-emphasis text |
| `neutral-900` | `#0F172A` | slate-900 | Page backgrounds (dark mode) |

### Semantic Colors

| Token | Color | Usage |
|-------|-------|-------|
| `success` | Green (`#059669`) | Successful transactions, confirmations |
| `error` | Red (`#DC2626`) | Errors, failed transactions, destructive actions |
| `warning` | Amber (`#D97706`) | Pending states, caution notices |
| `info` | Blue (`#2563EB`) | Informational messages, tips |

---

## Typography

### Font Families

| Script | Font | Fallback |
|--------|------|----------|
| Latin | Inter | system-ui, -apple-system, sans-serif |
| Devanagari (Hindi) | Noto Sans Devanagari | sans-serif |
| Telugu | Noto Sans Telugu | sans-serif |

### Type Scale

| Token | Size (px) | Size (rem) | Line Height | Usage |
|-------|-----------|------------|-------------|-------|
| `xs` | 12 | 0.75 | 1.33 | Captions, labels |
| `sm` | 14 | 0.875 | 1.43 | Secondary text, metadata |
| `base` | 16 | 1.0 | 1.5 | Body text |
| `lg` | 18 | 1.125 | 1.56 | Emphasized body, subheadings |
| `xl` | 20 | 1.25 | 1.4 | Section headings |
| `2xl` | 24 | 1.5 | 1.33 | Page headings |
| `3xl` | 30 | 1.875 | 1.27 | Hero headings |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `regular` | 400 | Body text |
| `medium` | 500 | Labels, navigation items |
| `semibold` | 600 | Subheadings, buttons |
| `bold` | 700 | Headings, emphasis |

---

## Spacing & Layout System

### Base Grid: 4px

All spacing uses multiples of 4px for visual consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Icon-to-text gap |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Standard padding, element gaps |
| `space-5` | 20px | Section padding (mobile) |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section gaps |
| `space-10` | 40px | Large section spacing |
| `space-12` | 48px | Page-level padding |
| `space-16` | 64px | Major section breaks |

### Layout Containers

| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Mobile | 100% | 16px |
| Tablet | 768px | 24px |
| Desktop | 1024px | 32px |

---

## Component Patterns

### Voice Recording Button

The primary interaction element. Must be:
- **Large**: Minimum 64px diameter (preferably 72px)
- **Prominent**: Elevated with shadow, contrasting color
- **Accessible**: 48px+ touch target, clear visual states
- **States**: Idle (blue), Recording (red with pulse animation), Processing (loading spinner)

```
┌─────────────────────────────┐
│                             │
│        ┌─────────┐          │
│        │   🎤    │  72px    │
│        │  (mic)  │  diameter│
│        └─────────┘          │
│     "Tap to speak"          │
│                             │
└─────────────────────────────┘
```

### Transaction Cards

Compact, scannable cards showing:
- Transaction type indicator (color-coded left border)
- Party name (bold, large)
- Amount (right-aligned, color-coded: green for income, red for expense)
- Date/time (secondary text)
- Category icon

### Confirmation Dialogs

Used after voice input processing:
- Clear summary of detected transaction
- Large "Confirm" (primary) and "Edit" (secondary) buttons
- Voice readback option
- Editable fields for corrections

### Dashboard Widgets

- Daily/weekly/monthly summary cards
- Cash flow indicator (visual bar or simple chart)
- Recent transactions list
- Outstanding balances (khata)
- Quick action shortcuts

### Navigation (Bottom Tabs — Mobile)

5-tab maximum for mobile bottom navigation:
1. **Home** — Dashboard overview
2. **Transactions** — Full transaction list
3. **Record** — Voice recording (center, elevated)
4. **Khata** — Customer/supplier ledgers
5. **Settings** — Profile, language, preferences

---

## Iconography

### Icon Set: Lucide Icons

- Consistent 24px viewBox
- 2px stroke width
- Rounded line caps and joins
- Use `w-6 h-6` (24px) for standard, `w-5 h-5` (20px) for compact contexts

### Key Icons

| Function | Icon Name |
|----------|-----------|
| Voice/Record | `mic` |
| Transactions | `receipt` |
| Income | `trending-up` |
| Expense | `trending-down` |
| Customer | `user` |
| Settings | `settings` |
| Search | `search` |
| Calendar | `calendar` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Confirm | `check` |
| Close | `x` |

---

## Accessibility Guidelines

### Standards: WCAG 2.1 Level AA

### Touch Targets
- Minimum touch target: **48px × 48px**
- Recommended for primary actions: **56px+**
- Spacing between targets: minimum **8px**

### Color Contrast
- Normal text: minimum **4.5:1** ratio
- Large text (18px+ or 14px bold): minimum **3:1** ratio
- UI components and graphics: minimum **3:1** ratio

### Screen Reader Support
- All interactive elements have accessible labels
- Voice status announcements via `aria-live` regions
- Logical heading hierarchy (h1 → h2 → h3)
- Form inputs associated with labels

### Keyboard Navigation
- All actions reachable via keyboard
- Visible focus indicators (2px ring, offset)
- Logical tab order

### Additional Considerations
- No information conveyed by color alone
- Error messages paired with icons and text
- Audio feedback supplemented by visual indicators
- Support for system font size preferences

---

## Responsive Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Design Priority
1. **375px** — Primary target (mobile portrait)
2. **768px** — Tablet
3. **1024px** — Desktop
4. **1440px** — Wide desktop

---

## Animation Principles

### Core Values
1. **Subtle** — Animations enhance, never distract
2. **Purposeful** — Every animation communicates state change
3. **Fast** — Duration between 150ms–300ms for interactions
4. **Accessible** — Respect `prefers-reduced-motion`

### Standard Durations

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150ms | ease-out |
| Transitions | 200ms | ease-in-out |
| Entrances | 300ms | ease-out |
| Exits | 200ms | ease-in |

### Key Animations
- **Recording pulse**: Subtle red ring pulse during voice recording
- **Card entry**: Fade-in + slight upward slide (staggered)
- **Button press**: Scale down to 0.97 on press
- **Page transitions**: Horizontal slide (mobile), fade (desktop)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark / Light Mode

### Light Mode (Default)
- Background: `slate-50` (#F8FAFC)
- Card surface: `white` (#FFFFFF)
- Text primary: `slate-800` (#1E293B)
- Text secondary: `slate-600` (#475569)
- Borders: `slate-200` (#E2E8F0)

### Dark Mode
- Background: `slate-900` (#0F172A)
- Card surface: `slate-800` (#1E293B)
- Text primary: `slate-50` (#F8FAFC)
- Text secondary: `slate-400` (#94A3B8)
- Borders: `slate-700` (#334155)

### Implementation
- Use CSS custom properties or Tailwind `dark:` variants
- Respect `prefers-color-scheme` system setting
- Provide manual toggle in settings
- Persist user preference in local storage

---

## File Structure (Assets)

```
assets/
├── fonts/
│   ├── Inter/
│   ├── NotoSansDevanagari/
│   └── NotoSansTelugu/
├── icons/
│   └── (lucide SVG exports)
├── images/
│   ├── logo/
│   └── illustrations/
└── tokens/
    ├── colors.json
    ├── typography.json
    └── spacing.json
```
