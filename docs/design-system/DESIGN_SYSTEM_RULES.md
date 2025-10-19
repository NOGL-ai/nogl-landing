# Design System Rules - Untitled UI Implementation

> **Comprehensive rules for integrating Figma designs with our Untitled UI-compliant codebase**  
> **Based on**: Untitled UI PRO STYLES v7.0  
> **Last Updated**: October 19, 2025

---

## Table of Contents

1. [Design System Structure](#design-system-structure)
2. [Token Definitions](#token-definitions)
3. [Component Library](#component-library)
4. [Styling Approach](#styling-approach)
5. [Typography System](#typography-system)
6. [Color System](#color-system)
7. [Spacing & Layout](#spacing--layout)
8. [Component Patterns](#component-patterns)
9. [Accessibility Standards](#accessibility-standards)
10. [Figma-to-Code Workflow](#figma-to-code-workflow)

---

## Design System Structure

### Overview

Our design system is fully aligned with **Untitled UI PRO STYLES v7.0** standards, implementing:
- 10,000+ component variants
- 900+ global styles
- 143+ design tokens
- Complete light/dark mode support
- WCAG 2.1 AA compliance

### Architecture

```
├── src/
│   ├── styles/
│   │   ├── theme.css          # Design tokens (CSS variables)
│   │   ├── globals.css         # Global styles & utilities
│   │   └── typography.css      # Typography system
│   ├── components/
│   │   ├── base/              # Foundational components
│   │   ├── application/       # Complex app components
│   │   ├── atoms/             # Smallest UI units
│   │   ├── molecules/         # Combined atoms
│   │   └── organisms/         # Complex compositions
├── tailwind.config.ts          # Tailwind + Untitled UI tokens
└── docs/design-system/         # Design system documentation
```

---

## Token Definitions

### Location

**Primary Token File**: `src/styles/theme.css`  
**Token Configuration**: `tailwind.config.ts`

### Token Structure

All tokens follow Untitled UI naming conventions:

```css
/* Format: --{category}-{property}-{variant} */
--color-text-primary
--color-bg-brand-solid
--color-border-error-subtle
```

### Token Categories

#### 1. Color Tokens

**File**: `src/styles/theme.css` (lines 120-453)

```css
/* Color Primitives (200+ shades) */
--color-gray-{25-950}        /* 11 shades */
--color-brand-{25-950}       /* 11 shades */
--color-error-{25-950}       /* 11 shades */
--color-warning-{25-950}     /* 11 shades */
--color-success-{25-950}     /* 11 shades */

/* Extended Palette */
--color-blue-{25-950}
--color-purple-{25-950}
--color-pink-{25-950}
--color-orange-{25-950}
/* ... 18 total color families */
```

**Semantic Color Tokens** (lines 455-543):

```css
/* Text Colors */
--color-text-primary: var(--color-gray-900);
--color-text-secondary: var(--color-gray-700);
--color-text-tertiary: var(--color-gray-500);
--color-text-quaternary: var(--color-gray-400);
--color-text-disabled: var(--color-gray-300);
--color-text-brand: var(--color-brand-600);
--color-text-error: var(--color-error-600);
--color-text-warning: var(--color-warning-600);
--color-text-success: var(--color-success-600);

/* Background Colors */
--color-bg-primary: var(--color-white);
--color-bg-secondary: var(--color-gray-50);
--color-bg-tertiary: var(--color-gray-100);
--color-bg-quaternary: var(--color-gray-200);
--color-bg-brand-solid: var(--color-brand-600);
--color-bg-brand-solid_hover: var(--color-brand-700);
--color-bg-error-solid: var(--color-error-500);
--color-bg-warning-solid: var(--color-warning-500);
--color-bg-success-solid: var(--color-success-500);

/* Border Colors */
--color-border-primary: var(--color-gray-200);
--color-border-secondary: var(--color-gray-100);
--color-border-tertiary: var(--color-gray-50);
--color-border-brand: var(--color-brand-300);
--color-border-error: var(--color-error-300);
```

#### 2. Typography Tokens

**File**: `src/styles/theme.css` (lines 11-47)

```css
/* Font Families */
--font-body: "Inter", -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
--font-display: "Inter", -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
--font-mono: ui-monospace, "Roboto Mono", SFMono-Regular, Menlo, Monaco, Consolas;

/* Text Scales */
--text-xs: 12px;     /* line-height: 18px */
--text-sm: 14px;     /* line-height: 20px */
--text-md: 16px;     /* line-height: 24px */
--text-lg: 18px;     /* line-height: 28px */
--text-xl: 20px;     /* line-height: 30px */

/* Display Scales */
--text-display-xs: 24px;    /* line-height: 32px */
--text-display-sm: 30px;    /* line-height: 38px */
--text-display-md: 36px;    /* line-height: 44px, letter-spacing: -0.72px */
--text-display-lg: 48px;    /* line-height: 60px, letter-spacing: -0.96px */
--text-display-xl: 60px;    /* line-height: 72px, letter-spacing: -1.2px */
--text-display-2xl: 72px;   /* line-height: 90px, letter-spacing: -1.44px */
```

#### 3. Spacing Tokens

**File**: `src/styles/theme.css` (implicit in calculations)

```css
/* Base Spacing Unit */
--spacing: 0.25rem; /* 4px */

/* Derived Spacing (based on --spacing) */
/* Examples: */
--text-xs: calc(var(--spacing) * 3);        /* 12px */
--text-sm: calc(var(--spacing) * 3.5);      /* 14px */
--text-md: calc(var(--spacing) * 4);        /* 16px */
```

**Tailwind Spacing Scale** (default, extends to):
- `0` to `96` (0px to 384px in 4px increments)
- Custom: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, etc.

#### 4. Shadow Tokens

**File**: `src/styles/theme.css` (lines 68-113)

```css
--shadow-xs: 0px 1px 2px rgba(10, 13, 18, 0.05);
--shadow-sm: 0px 1px 3px rgba(10, 13, 18, 0.1), 0px 1px 2px -1px rgba(10, 13, 18, 0.1);
--shadow-md: 0px 4px 6px -1px rgba(10, 13, 18, 0.1), 0px 2px 4px -2px rgba(10, 13, 18, 0.06);
--shadow-lg: 0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03), 0px 2px 2px -1px rgba(10, 13, 18, 0.04);
--shadow-xl: 0px 20px 24px -4px rgba(10, 13, 18, 0.08), 0px 8px 8px -4px rgba(10, 13, 18, 0.03), 0px 3px 3px -1.5px rgba(10, 13, 18, 0.04);
--shadow-2xl: 0px 24px 48px -12px rgba(10, 13, 18, 0.18), 0px 4px 4px -2px rgba(10, 13, 18, 0.04);
--shadow-3xl: 0px 32px 64px -12px rgba(10, 13, 18, 0.14), 0px 5px 5px -2.5px rgba(10, 13, 18, 0.04);
```

#### 5. Border Radius Tokens

**File**: `src/styles/theme.css` (lines 56-66)

```css
--radius-none: 0px;
--radius-xs: 0.125rem;    /* 2px */
--radius-sm: 0.25rem;     /* 4px */
--radius-DEFAULT: 0.25rem;
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

### Token Transformation System

**Tailwind Configuration**: `tailwind.config.ts`

Tokens are transformed from CSS variables to Tailwind utility classes:

```typescript
// tailwind.config.ts (lines 40-150)
colors: {
  // Untitled UI Standard Tokens
  "text-primary": "var(--color-text-primary)",
  "text-secondary": "var(--color-text-secondary)",
  "bg-primary": "var(--color-bg-primary)",
  "bg-brand-solid": "var(--color-bg-brand-solid)",
  "border-primary": "var(--color-border-primary)",
  // ... 143 total tokens
}
```

**Usage in Components**:

```tsx
// Tokens automatically work with Tailwind classes
<div className="bg-bg-primary text-text-primary border border-border-primary">
  Content
</div>
```

### Dark Mode Token Overrides

**File**: `src/styles/theme.css` (lines 570-652)

```css
:where(.dark, .dark-mode) {
  /* Text Colors Inverted */
  --color-text-primary: var(--color-gray-25);
  --color-text-secondary: var(--color-gray-200);
  
  /* Background Colors Inverted */
  --color-bg-primary: var(--color-gray-950);
  --color-bg-secondary: var(--color-gray-900);
  
  /* Border Colors Adjusted */
  --color-border-primary: var(--color-gray-800);
  --color-border-secondary: var(--color-gray-700);
}
```

---

## Component Library

### Location

**Base Components**: `src/components/base/`
**Application Components**: `src/components/application/`
**Atomic Components**: `src/components/atoms/`, `molecules/`, `organisms/`

### Component Architecture

We follow **Atomic Design** principles combined with feature-based organization:

```
src/components/
├── base/                    # Foundational UI elements
│   ├── buttons/
│   ├── input/
│   ├── checkbox/
│   ├── select/
│   ├── avatar/
│   └── ...
├── application/             # Complex application components
│   ├── modals/
│   ├── table/
│   ├── app-navigation/
│   └── ...
├── atoms/                   # Smallest UI units
├── molecules/               # Combined atoms
└── organisms/               # Complex compositions
```

### Component Standards

#### Button Component Example

**File**: `src/components/base/buttons/` (implied pattern)

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  className,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium rounded-lg',
        'transition-colors duration-200',
        'disabled:cursor-not-allowed',
        
        // Variant styles
        {
          'bg-bg-brand-solid text-text-on-brand hover:bg-bg-brand-solid-hover active:bg-bg-brand-solid-active disabled:bg-bg-brand-solid-disabled': variant === 'primary',
          'bg-bg-secondary text-text-primary border border-border-primary hover:bg-bg-tertiary': variant === 'secondary',
          'bg-transparent text-text-secondary hover:bg-bg-secondary': variant === 'ghost',
          'bg-bg-error-solid text-text-on-brand hover:bg-bg-error-solid-hover': variant === 'error',
        },
        
        // Size styles
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-md': size === 'md',
          'px-5 py-3 text-lg': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Component Documentation

Component usage examples are available in:
- `docs/examples/` - Usage examples
- `docs/design-system/COMPONENT_PATTERNS.md` - Detailed patterns
- Inline JSDoc comments in component files

---

## Styling Approach

### CSS Methodology

**Primary**: **Tailwind CSS** with design token extensions  
**Secondary**: **CSS Modules** for component-specific styles (`.scss` files)

### File Structure

```
src/styles/
├── theme.css              # Design tokens (CSS variables)
├── globals.css            # Global utilities & base styles
├── typography.css         # Typography-specific styles
├── sidebar-animations.css # Component-specific animations
└── mailchimp-popup.css    # Third-party integrations
```

### Global Styles

**File**: `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "./theme.css";
@import "./typography.css";

/* Custom Utilities */
@utility scrollbar-hide {
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### Responsive Design Implementation

**Tailwind Breakpoints** (default):

```typescript
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

**Usage**:

```tsx
<div className="
  w-full 
  px-4 sm:px-6 md:px-8 
  text-sm md:text-md lg:text-lg
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
  Responsive content
</div>
```

---

## Typography System

### Font Families

**Body Text**: Inter (with fallbacks)  
**Display Text**: Inter  
**Monospace**: JetBrains Mono, Roboto Mono

**Configuration**: `tailwind.config.ts` (lines 152-156)

```typescript
fontFamily: {
  sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
  serif: ["Georgia", "Times New Roman", "serif"],
}
```

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 18px | Fine print, labels |
| `text-sm` | 14px | 20px | Secondary text, captions |
| `text-md` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Emphasized text |
| `text-xl` | 20px | 30px | Small headings |
| `text-display-xs` | 24px | 32px | H6 |
| `text-display-sm` | 30px | 38px | H5 |
| `text-display-md` | 36px | 44px | H4 |
| `text-display-lg` | 48px | 60px | H3 |
| `text-display-xl` | 60px | 72px | H2 |
| `text-display-2xl` | 72px | 90px | H1 |

### Typography Usage

```tsx
<div>
  <h1 className="text-text-primary" style={{ fontSize: 'var(--text-display-2xl)', lineHeight: 'var(--text-display-2xl--line-height)' }}>
    Main Heading
  </h1>
  <p className="text-text-secondary text-md">
    Body paragraph with standard size
  </p>
  <span className="text-text-tertiary text-sm">
    Caption or metadata
  </span>
</div>
```

---

## Color System

### Color Hierarchy

1. **Primitives** (200+ shades): Base color scales
2. **Semantic Tokens**: Context-based colors
3. **Component Tokens**: Component-specific applications

### Usage Guidelines

#### ✅ DO: Use Semantic Tokens

```tsx
<button className="bg-bg-brand-solid text-text-on-brand">
  Primary Button
</button>
```

#### ❌ DON'T: Use Primitives Directly

```tsx
<button className="bg-brand-600 text-white">
  Button
</button>
```

### Color Contrast Requirements (WCAG 2.1 AA)

- **Normal Text** (< 18pt): Minimum 4.5:1 contrast
- **Large Text** (≥ 18pt or ≥ 14pt bold): Minimum 3:1 contrast
- **UI Components**: Minimum 3:1 contrast

**Tested Combinations**:

| Background | Text | Contrast | Pass |
|------------|------|----------|------|
| `--color-bg-primary` (white) | `--color-text-primary` (gray-900) | 16.8:1 | ✅ AAA |
| `--color-bg-secondary` (gray-50) | `--color-text-primary` | 15.9:1 | ✅ AAA |
| `--color-bg-brand-solid` (brand-600) | `--color-text-on-brand` (white) | 6.2:1 | ✅ AA |

---

## Spacing & Layout

### Spacing Scale

Based on `--spacing: 0.25rem` (4px)

**Tailwind Classes**:
- `p-1` = 4px
- `p-2` = 8px
- `p-3` = 12px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `p-12` = 48px
- `p-16` = 64px

### Layout Patterns

#### Container Widths

```css
--max-width-container: 1280px;
```

**Usage**:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  Container content
</div>
```

#### Grid System

```tsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">
    Column
  </div>
</div>
```

---

## Component Patterns

### Button Patterns

```tsx
// Primary
<button className="bg-bg-brand-solid text-text-on-brand hover:bg-bg-brand-solid-hover px-4 py-2 rounded-lg">
  Primary
</button>

// Secondary
<button className="bg-bg-secondary text-text-primary border border-border-primary hover:bg-bg-tertiary px-4 py-2 rounded-lg">
  Secondary
</button>

// Error
<button className="bg-bg-error-solid text-text-on-brand hover:bg-bg-error-solid-hover px-4 py-2 rounded-lg">
  Delete
</button>
```

### Input Patterns

```tsx
<div className="space-y-2">
  <label className="block text-text-secondary text-sm font-medium">
    Email
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    className="
      w-full px-3 py-2
      bg-bg-primary
      text-text-primary
      border border-border-primary
      rounded-lg
      placeholder:text-text-placeholder
      focus:border-border-brand
      focus:ring-2 focus:ring-bg-brand-secondary
      disabled:bg-bg-disabled
      disabled:text-text-disabled
    "
  />
</div>
```

### Card Patterns

```tsx
<div className="
  bg-bg-primary
  border border-border-primary
  rounded-lg
  p-6
  shadow-md
  hover:shadow-lg
  transition-shadow
">
  <h3 className="text-text-primary font-semibold mb-2">
    Card Title
  </h3>
  <p className="text-text-secondary mb-4">
    Card description
  </p>
</div>
```

---

## Accessibility Standards

### Focus States

All interactive elements MUST have visible focus states:

```tsx
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-border-brand
  focus:ring-offset-2
">
  Button
</button>
```

### Keyboard Navigation

- `Tab` - Navigate forward
- `Shift+Tab` - Navigate backward
- `Enter` / `Space` - Activate buttons
- `Escape` - Close modals/dropdowns

### ARIA Attributes

```tsx
// Buttons
<button aria-label="Close dialog">
  <XIcon />
</button>

// Inputs
<input
  aria-invalid="true"
  aria-describedby="error-message"
/>
<span id="error-message" className="text-text-error">
  Email is required
</span>
```

---

## Figma-to-Code Workflow

### Step 1: Review Figma Design

**Figma File**: [Untitled UI PRO STYLES v7.0](https://www.figma.com/design/E4hWuxZhRqGSAiDA8NePGk/)

1. Identify components and their variants
2. Note colors, spacing, typography
3. Check for interactions and states

### Step 2: Map Figma Tokens to Code

| Figma Token | Code Token | Tailwind Class |
|-------------|------------|----------------|
| Text/Primary | `--color-text-primary` | `text-text-primary` |
| Background/Primary | `--color-bg-primary` | `bg-bg-primary` |
| Border/Primary | `--color-border-primary` | `border-border-primary` |
| Brand/600 | `--color-bg-brand-solid` | `bg-bg-brand-solid` |

### Step 3: Build Components

```tsx
// From Figma design to code
import { Button } from '@/components/base/buttons/button';

export function FeatureCard() {
  return (
    <div className="bg-bg-primary border border-border-primary rounded-lg p-6">
      <h3 className="text-text-primary text-xl font-semibold mb-2">
        Feature Title
      </h3>
      <p className="text-text-secondary mb-4">
        Feature description
      </p>
      <Button variant="primary">
        Learn More
      </Button>
    </div>
  );
}
```

### Step 4: Verify Implementation

- ✅ Colors match Figma
- ✅ Spacing matches Figma
- ✅ Typography matches Figma
- ✅ Dark mode works correctly
- ✅ Responsive behavior works
- ✅ Accessibility standards met

---

## Best Practices

### 1. Always Use Semantic Tokens

```tsx
// ✅ Good
<div className="bg-bg-primary text-text-primary">

// ❌ Bad
<div className="bg-white text-gray-900">
```

### 2. Use Consistent Spacing

```tsx
// ✅ Good - uses spacing scale
<div className="p-4 gap-6">

// ❌ Bad - arbitrary values
<div className="p-[17px] gap-[23px]">
```

### 3. Implement Dark Mode from Start

```tsx
// ✅ Tokens handle dark mode automatically
<div className="bg-bg-primary text-text-primary">
  Works in both themes!
</div>
```

### 4. Component Composition

```tsx
// ✅ Good - composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// ❌ Bad - monolithic
<Card title="Title" content="Content" />
```

### 5. Accessibility First

```tsx
// ✅ Good
<button
  aria-label="Close"
  className="focus:ring-2 focus:ring-border-brand"
>
  <XIcon />
</button>

// ❌ Bad
<div onClick={handleClose}>
  <XIcon />
</div>
```

---

## Quick Reference

### Common Token Patterns

```tsx
// Text Hierarchy
text-text-primary          // Main text
text-text-secondary        // Supporting text
text-text-tertiary         // Subtle text

// Backgrounds
bg-bg-primary              // Main background
bg-bg-secondary            // Subtle contrast
bg-bg-brand-solid          // Brand buttons

// Borders
border-border-primary      // Standard borders
border-border-brand        // Focus states

// States
hover:bg-bg-brand-solid-hover
active:bg-bg-brand-solid-active
disabled:bg-bg-brand-solid-disabled
```

### Resources

- [Token Reference](./UNTITLED_UI_TOKEN_REFERENCE.md) - Complete token catalog
- [Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md) - How to migrate
- [Component Patterns](./COMPONENT_PATTERNS.md) - Component library
- [Figma Integration](./FIGMA_INTEGRATION_GUIDE.md) - Figma workflow

---

**Last Updated**: October 19, 2025  
**Maintained By**: Design System Team  
**Figma File**: [Untitled UI PRO STYLES v7.0](https://www.figma.com/design/E4hWuxZhRqGSAiDA8NePGk/)

