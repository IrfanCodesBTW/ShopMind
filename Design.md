# DESIGN.md

> Product Design System & UX Guidelines
>
> Version: 1.0
> Status: Production
> Last Updated: July 2026

---

# Design Philosophy

## Vision

The product should feel calm, intelligent, and effortless.

Instead of looking like another AI application filled with gradients, glowing borders, and futuristic effects, the interface should resemble a premium productivity tool that users trust every day.

The experience should communicate:

- Confidence
- Clarity
- Simplicity
- Warmth
- Precision

Every interaction should reduce cognitive load.

---

# Core Principles

## 1. Human First

The interface exists to support the user—not impress them.

Avoid unnecessary visual noise.

---

## 2. Calm Technology

Technology should disappear.

Users should focus on their work rather than the interface.

---

## 3. Editorial Quality

Use whitespace intentionally.

Layouts should resemble premium magazines rather than enterprise dashboards.

---

## 4. Functional Beauty

Beauty follows usability.

Every component must have a purpose.

---

## 5. Motion with Meaning

Animations should communicate state changes.

Never animate simply because it looks interesting.

---

# Brand Personality

The product should feel like:

- Apple Notes
- Linear
- Raycast
- Arc Browser
- Notion
- Stripe Docs

Avoid looking like:

- Crypto dashboards
- Gaming interfaces
- Sci-fi AI products
- Neon cyberpunk UIs

---

# Visual Identity

## Emotional Keywords

- Warm
- Premium
- Minimal
- Trustworthy
- Professional
- Intelligent
- Friendly
- Focused

---

# Color System

## Primary

Background

```
#F7F7F5
```

Surface

```
#FFFFFF
```

Primary Text

```
#111111
```

Secondary Text

```
#666666
```

Muted Text

```
#8B8B8B
```

Border

```
#E8E8E8
```

Divider

```
#ECECEC
```

---

## Accent

Primary Green

```
#2D6A4F
```

Hover

```
#1B4332
```

Success

```
#2ECC71
```

Warning

```
#F4B400
```

Error

```
#E53935
```

Info

```
#2196F3
```

---

## Dark Mode

Background

```
#0E0E10
```

Surface

```
#18181B
```

Card

```
#202024
```

Text

```
#F5F5F5
```

Secondary Text

```
#BBBBBB
```

Border

```
rgba(255,255,255,.08)
```

---

# Typography

## Primary Font

Figtree

Weights

- 400
- 500
- 600
- 700

---

## Secondary Font

Editorial Serif

Used only for:

- Hero headings
- Marketing pages
- Landing pages
- Large quotes

Never use serif inside dashboards.

---

# Type Scale

## H1

72px

Weight 700

Line Height 1.05

---

## H2

56px

---

## H3

40px

---

## H4

32px

---

## H5

24px

---

## H6

20px

---

## Body Large

18px

---

## Body

16px

---

## Small

14px

---

## Caption

12px

---

# Spacing System

Base Unit

```
8px
```

Spacing Scale

```
4
8
12
16
24
32
40
48
64
80
96
128
```

Never invent arbitrary spacing values.

---

# Grid System

Desktop

12 Columns

Container

1280px

---

Tablet

8 Columns

---

Mobile

4 Columns

---

# Border Radius

Small

8px

Medium

12px

Large

16px

Extra Large

24px

Pill

999px

---

# Elevation

Use shadows sparingly.

Card

```
0 4px 20px rgba(0,0,0,.04)
```

Modal

```
0 20px 60px rgba(0,0,0,.15)
```

Dropdown

```
0 8px 30px rgba(0,0,0,.08)
```

---

# Components

## Buttons

### Primary

Green

Filled

Rounded

Height

48px

---

### Secondary

White

Border

Green Text

---

### Ghost

Transparent

Text only

---

### Danger

Red

Filled

---

# Inputs

Height

48px

Radius

12px

Padding

16px

States

- Default
- Hover
- Focus
- Disabled
- Error

---

# Cards

Padding

32px

Radius

16px

Border

1px

Very subtle shadow.

---

# Navigation

Desktop

Sticky navigation

Transparent initially

Blur after scrolling.

---

Mobile

Hamburger menu

Fullscreen drawer

---

# Layout

Maximum Width

1280px

Section Padding

Desktop

120px

Tablet

80px

Mobile

64px

---

# Hero

Large typography

Minimal copy

Strong CTA

Illustration or product visualization

Never overload hero with features.

---

# Feature Sections

Use alternating layouts.

Left image

Right content

Then reverse.

This creates visual rhythm.

---

# Motion

Animation Duration

Fast

150ms

Normal

250ms

Slow

400ms

---

Easing

```
ease-out
```

Preferred

Spring animations

Subtle fades

Opacity transitions

Small translations

---

Avoid

Bounce

Elastic

Spin

Flash

---

# Icons

Style

Rounded

Outline

24px grid

2px stroke

Examples

- Lucide
- Heroicons

---

# Illustrations

Style

Organic

Editorial

Human

Soft gradients

Avoid

3D AI robots

Floating cubes

Circuit boards

Abstract neural networks

---

# Imagery

Photography

Natural lighting

Editorial composition

Real people

Real workspaces

No stock-photo aesthetics.

---

# Accessibility

Minimum Contrast

WCAG AA

Keyboard Navigation

Required

Visible Focus States

Required

Reduced Motion

Supported

Semantic HTML

Required

Alt Text

Required

Screen Reader Labels

Required

---

# Responsive Design

## Desktop

1440+

Full layouts

12-column grid

---

## Laptop

1024+

Reduced spacing

---

## Tablet

768+

8-column layout

---

## Mobile

390+

Single-column layout

Large touch targets

Bottom spacing increased.

---

# Empty States

Every empty state should explain:

- Why nothing exists
- What users should do next
- Primary CTA

Avoid dead ends.

---

# Loading States

Use skeleton loaders.

Avoid spinners longer than 1 second.

---

# Error States

Explain:

- What happened
- Why it happened
- How to fix it

Avoid technical jargon.

---

# Design Tokens

## Radius

```
radius-sm
radius-md
radius-lg
radius-xl
radius-pill
```

## Colors

```
color-primary
color-secondary
color-surface
color-background
color-success
color-warning
color-error
```

## Typography

```
font-heading
font-body
font-serif
```

## Spacing

```
space-1
space-2
space-3
...
space-16
```

---

# UX Guidelines

Always prioritize:

- Simplicity
- Clarity
- Readability
- Accessibility
- Performance

Every screen should answer:

1. Where am I?
2. What can I do?
3. What should I do next?

---

# Performance Budget

Target Lighthouse Score

95+

Largest Contentful Paint

<2.5s

Interaction to Next Paint

<200ms

CLS

<0.1

---

# Design Checklist

Before shipping a screen:

- Consistent spacing
- Correct typography
- Responsive layout
- Accessible contrast
- Keyboard support
- Loading state
- Empty state
- Error state
- Motion reviewed
- Mobile tested
- Dark mode tested

---

# Design North Star

Design software that disappears.

The interface should feel invisible, allowing users to focus entirely on their work while quietly communicating craftsmanship, trust, and clarity.