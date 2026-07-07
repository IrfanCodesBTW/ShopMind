# AI Coding Rules — ShopMind

> **Source:** `new_Design_plan.md` §5 (AI Coding Rules)  
> **Status:** Enforced  
> **Scope:** All components, pages, and utility files in `src/`

---

## Critical Rules (Never Break)

- **Never hardcode colors** — always use semantic CSS variables from `tokens/colors.json`
  - ✅ `color: var(--color-primary)` 
  - ❌ `color: #2D6A4F`

- **Never hardcode spacing** — always use spacing tokens
  - ✅ `padding: var(--space-4)`
  - ❌ `padding: 16px`

- **Always use tokens from `tokens/*.json` / CSS variables** — single source of truth

- **Never bypass the component library** — compose from primitives
  - ✅ `<Button variant="primary">`
  - ❌ `<button className="bg-green-600 text-white px-4 py-2">`

- **Never create duplicate components** — extend or compose existing ones

- **No inline styles unless dynamically computed** (e.g., chart colors from data)

- **Never use emoji as UI icons** — use Lucide SVGs from `lucide-react`
  - ✅ `<ShoppingCart className="w-5 h-5" />`
  - ❌ `🛒`

---

## Component Rules

- Every component must:
  - Accept `className` for extension
  - Use `React.forwardRef` if it wraps a DOM element
  - Support dark mode via token inheritance (no `.dark:` overrides on colors that are already tokenized)
  - Be responsive (375px → 1440px)
  - Be keyboard accessible
  - Have TypeScript types for all props

- Every interactive element must:
  - Have `cursor-pointer`
  - Have visible focus ring (`:focus-visible`)
  - Have `aria-label` if it has no text content
  - Have ≥ 48px touch target (use `.touch-target` class)

---

## Accessibility Rules

- All form inputs must have an associated `<label>` via `htmlFor` + `id`
- All images must have `alt` text
- All icons used decoratively must have `aria-hidden="true"`
- Error messages must use `role="alert"` or `aria-invalid`
- Modals must trap focus and restore on close
- Motion must respect `prefers-reduced-motion` (already handled in `globals.css`)

---

## Typography Rules

- Use Figtree (`var(--font-body)`) for all application text
- Use Fraunces (`var(--font-serif)`) ONLY on marketing/landing pages — never inside `(app)/`
- Never use raw pixel font sizes — use token variables: `text-[var(--text-sm)]`, etc.

---

## Semantic Color Mapping

| Use case | Token |
|----------|-------|
| Income / sales | `--color-income` |
| Expense | `--color-expense` |
| Credit given | `--color-credit-given` |
| Credit received | `--color-credit-received` |
| Voice idle | `--color-voice-idle` |
| Recording active | `--color-recording` |
| Voice processing | `--color-voice-processing` |
| Page background | `--color-bg` |
| Card/surface | `--color-surface` |
| Primary action | `--color-primary` |

---

## Performance Rules

- Import Lucide icons individually: `import { Mic } from 'lucide-react'`
- Use `next/image` for all images with `alt`, `width`, `height`
- Use route-based code splitting (Next.js App Router handles this automatically)
- Never import entire utility libraries — tree-shake

---

## Documentation Rule

All new components must be added to `docs/STYLE_GUIDE.md` with:
- Usage example
- Prop table
- Do / Don't example
