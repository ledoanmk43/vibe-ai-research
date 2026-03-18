# 03 — UI/UX Design Guidelines

> **Document Status:** Definitive MUI theme configuration and component styling reference.

---

## 1. Design Philosophy

**"Vibrant, modern, airy."** Light, spacious, delightful. Pinterest-inspired aesthetic crossed with a modern SaaS dashboard.

- **Airy spacing** — Generous padding and margins.
- **Soft & rounded** — Rounded corners everywhere.
- **Gradient accents** — Pink-to-blue gradients on primary actions.
- **Crisp whites** — Clean white backgrounds; color as accent.
- **Subtle depth** — Light shadows and glassmorphism for elevation.

---

## 2. Color Palette

### 2.1 Core Colors

| Token | Hex | Usage |
|---|---|---|
| **Primary (Pink)** | `#E91E90` | Primary buttons, active states, links |
| **Primary Light** | `#F472B6` | Hover states, light badges |
| **Primary Dark** | `#BE185D` | Pressed/active states |
| **Secondary (Light Blue)** | `#38BDF8` | Secondary buttons, info badges, charts |
| **Secondary Light** | `#7DD3FC` | Secondary hover states |
| **Secondary Dark** | `#0284C7` | Secondary pressed states |

### 2.2 Gradients

| Name | CSS Value | Usage |
|---|---|---|
| **Primary Gradient** | `linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)` | Headers, hero cards, primary CTAs |
| **Subtle Gradient** | `linear-gradient(135deg, #FDF2F8 0%, #EFF6FF 100%)` | Card/section backgrounds |
| **Sidebar Gradient** | `linear-gradient(180deg, #1E1B4B 0%, #312E81 50%, #3B1C5A 100%)` | Sidebar nav background |

### 2.3 Neutrals

| Token | Hex | Usage |
|---|---|---|
| **Background** | `#FAFBFC` | Main page background |
| **Surface** | `#FFFFFF` | Cards, modals, dialogs |
| **Border** | `#E5E7EB` | Dividers, input borders |
| **Text Primary** | `#1F2937` | Headings, body text |
| **Text Secondary** | `#6B7280` | Captions, labels |
| **Text Disabled** | `#9CA3AF` | Disabled state text |

### 2.4 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| **Success** | `#10B981` | Completed status, success toasts |
| **Warning** | `#F59E0B` | Processing status, warnings |
| **Error** | `#EF4444` | Cancelled status, form errors |
| **Info** | `#3B82F6` | Pending status, info badges |

---

## 3. Typography

**Font:** `Inter` (Google Fonts) — weights 300, 400, 500, 600, 700.

| Variant | Size | Weight | Line Height |
|---|---|---|---|
| `h1` | 2rem | 700 | 1.2 |
| `h2` | 1.75rem | 700 | 1.3 |
| `h3` | 1.5rem | 600 | 1.3 |
| `h4` | 1.25rem | 600 | 1.4 |
| `body1` | 1rem | 400 | 1.6 |
| `body2` | 0.875rem | 400 | 1.5 |
| `caption` | 0.75rem | 300 | 1.5 |
| `button` | — | 600 | — (textTransform: none) |

---

## 4. MUI Theme Configuration

```typescript
// apps/web/src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#E91E90', light: '#F472B6', dark: '#BE185D', contrastText: '#FFFFFF' },
    secondary: { main: '#38BDF8', light: '#7DD3FC', dark: '#0284C7', contrastText: '#FFFFFF' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: { default: '#FAFBFC', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280', disabled: '#9CA3AF' },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});
```

---

## 5. Component Style Rules

### 5.1 Buttons
- `borderRadius: 10`, padding `10px 24px`.
- `containedPrimary`: gradient background `#E91E90 → #F472B6`.
- Hover: glow shadow `rgba(233,30,144,0.3)`.
- `outlined`: `1.5px` border, pink tint on hover.

### 5.2 Cards
- `borderRadius: 16`, border `1px solid #E5E7EB`.
- Hover: `translateY(-2px)` + increased shadow.
- Content padding: `24px`.

### 5.3 Text Fields
- Variant: `outlined`, `fullWidth` by default.
- Input `borderRadius: 10`, border `1.5px`.
- Focus border: `#E91E90`, `2px`.
- Hover border: `#F472B6`.

### 5.4 Data Tables
- Head: `#F9FAFB` background, uppercase `0.75rem` labels.
- Row hover: `#FDF2F8` (subtle pink tint).
- Cell padding: `16px 20px`.

### 5.5 Dialogs/Modals
- Paper `borderRadius: 20`, shadow `0px 25px 50px rgba(0,0,0,0.12)`.
- Title: `1.25rem`, weight 700.

### 5.6 Status Chips (Order Status)

| Status | Background | Text Color |
|---|---|---|
| `PENDING` | `#DBEAFE` | `#1E40AF` |
| `PROCESSING` | `#FEF3C7` | `#92400E` |
| `READY_FOR_PICKUP` | `#E0F2FE` | `#0369A1` |
| `COMPLETED` | `#D1FAE5` | `#065F46` |
| `CANCELLED` | `#FEE2E2` | `#991B1B` |

---

## 6. Layout

### 6.1 Sidebar
- Width: 260px expanded / 72px collapsed.
- Background: Sidebar Gradient (dark indigo/purple).
- Active item: left border `#E91E90`, bg `rgba(255,255,255,0.1)`.

### 6.2 Top Bar
- Height: 64px, white bg, bottom border `#E5E7EB`.
- Content: Breadcrumbs (left), user avatar (right).

### 6.3 Page Content
- Max width: `1280px`, centered. Padding: `32px` desktop / `16px` mobile.

### 6.4 Breakpoints
| BP | Width | Sidebar |
|---|---|---|
| `xs` | 0–599px | Hamburger menu |
| `sm` | 600–899px | Collapsed |
| `md` | 900–1199px | Collapsed (72px) |
| `lg` | 1200px+ | Expanded (260px) |

---

## 7. Glassmorphism

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}
```

**Use for:** Login card, dashboard KPI cards, modal backdrops.
**Avoid for:** Data tables, forms, standard CRUD pages.

---

## 8. Animations

| Element | Effect | Duration |
|---|---|---|
| Page transitions | Fade + slide up 8px | 300ms ease-out |
| Card hover | translateY(-2px) + shadow | 200ms ease-in-out |
| Button hover | Shadow glow | 150ms |
| Modal enter | Scale 0.95→1 + fade | 250ms |
| Skeleton loading | Pulse shimmer | 1500ms linear ∞ |
| Toast | Slide from right | 300ms |

---

## 9. Icons

- Library: `@mui/icons-material` (Rounded variant).
- Nav icons: 24px, white. Action icons: 20px. Status icons: 16px.

---

> **Previous:** [02_database_schema.md](./02_database_schema.md) | **Next:** [04_api_contracts.md](./04_api_contracts.md)
