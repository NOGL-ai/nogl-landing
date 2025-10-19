# Untitled UI Token Reference

> **Complete reference for all Untitled UI design tokens in our system**  
> **Last Updated**: October 2025

## Table of Contents

- [Text Tokens](#text-tokens)
- [Background Tokens](#background-tokens)
- [Border Tokens](#border-tokens)
- [Foreground (Icon) Tokens](#foreground-icon-tokens)
- [Color Primitives](#color-primitives)
- [Usage Guidelines](#usage-guidelines)
- [Dark Mode Behavior](#dark-mode-behavior)

---

## Text Tokens

Text tokens are used for all text content. Use the `text-` utility class.

### Hierarchy Tokens

| Token | CSS Variable | Light Mode | Dark Mode | Usage |
|-------|--------------|------------|-----------|-------|
| `text-text-primary` | `--color-text-primary` | gray-900 | gray-25 | Primary text, headings, body copy |
| `text-text-secondary` | `--color-text-secondary` | gray-700 | gray-200 | Supporting text, labels, descriptions |
| `text-text-tertiary` | `--color-text-tertiary` | gray-500 | gray-400 | Captions, metadata, timestamps |
| `text-text-quaternary` | `--color-text-quaternary` | gray-400 | gray-500 | Very subtle hints, inactive items |
| `text-text-disabled` | `--color-text-disabled` | gray-300 | gray-600 | Disabled state text |

**Examples:**

```tsx
<h1 className="text-text-primary">Main Heading</h1>
<p className="text-text-secondary">Supporting paragraph</p>
<span className="text-text-tertiary text-sm">Posted 2 hours ago</span>
<button disabled className="text-text-disabled">Disabled Button</button>
```

### Placeholder Tokens

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `text-text-placeholder` | `--color-text-tertiary` | Standard input placeholders |
| `text-text-placeholder-subtle` | `--color-text-quaternary` | Subtle/secondary placeholders |

**Examples:**

```tsx
<input 
  placeholder="Enter email"
  className="placeholder:text-text-placeholder"
/>
```

### Brand Tokens

| Token | CSS Variable | Light Mode | Dark Mode | Usage |
|-------|--------------|------------|-----------|-------|
| `text-text-brand` | `--color-text-brand` | brand-600 | brand-400 | Brand colored text, links |
| `text-text-brand-secondary` | `--color-text-brand-secondary` | brand-700 | brand-300 | Secondary brand text |
| `text-text-on-brand` | `--color-text-on-brand` | white | gray-25 | Text on brand backgrounds |
| `text-text-on-brand-secondary` | `--color-text-on-brand-secondary` | gray-100 | gray-200 | Secondary text on brand |

**Examples:**

```tsx
<a href="#" className="text-text-brand hover:text-text-brand-secondary">
  Brand Link
</a>

<button className="bg-bg-brand-solid text-text-on-brand">
  Call to Action
</button>
```

### Semantic Color Tokens

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `text-text-error` | `--color-text-error` | Error messages, destructive actions |
| `text-text-error-secondary` | `--color-text-error-secondary` | Secondary error text |
| `text-text-warning` | `--color-text-warning` | Warning messages, cautionary text |
| `text-text-warning-secondary` | `--color-text-warning-secondary` | Secondary warning text |
| `text-text-success` | `--color-text-success` | Success messages, confirmations |
| `text-text-success-secondary` | `--color-text-success-secondary` | Secondary success text |

**Examples:**

```tsx
<p className="text-text-error">Error: Invalid email address</p>
<p className="text-text-warning">Warning: This action cannot be undone</p>
<p className="text-text-success">Success! Your changes have been saved</p>
```

---

## Background Tokens

Background tokens are used for component backgrounds. Use the `bg-` utility class.

### Hierarchy Tokens

| Token | CSS Variable | Light Mode | Dark Mode | Usage |
|-------|--------------|------------|-----------|-------|
| `bg-bg-primary` | `--color-bg-primary` | white | gray-950 | Main canvas, primary surfaces |
| `bg-bg-secondary` | `--color-bg-secondary` | gray-50 | gray-900 | Subtle contrast backgrounds |
| `bg-bg-tertiary` | `--color-bg-tertiary` | gray-100 | gray-800 | More pronounced contrast |
| `bg-bg-quaternary` | `--color-bg-quaternary` | gray-200 | gray-700 | Highest contrast backgrounds |
| `bg-bg-disabled` | `--color-bg-disabled` | gray-100 | gray-800 | Disabled element backgrounds |

**Examples:**

```tsx
<body className="bg-bg-primary">
  <div className="bg-bg-secondary rounded-lg p-4">
    <div className="bg-bg-tertiary p-2">
      Nested backgrounds
    </div>
  </div>
</body>
```

### Brand Backgrounds

| Token | CSS Variable | Light Mode | Dark Mode | Usage |
|-------|--------------|------------|-----------|-------|
| `bg-bg-brand` | `--color-bg-brand` | brand-500 | brand-700 | Brand background (subtle) |
| `bg-bg-brand-secondary` | `--color-bg-brand-secondary` | brand-50 | brand-900 | Secondary brand background |
| `bg-bg-brand-solid` | `--color-bg-brand-solid` | brand-600 | brand-600 | Solid brand buttons/badges |
| `bg-bg-brand-solid-hover` | `--color-bg-brand-solid_hover` | brand-700 | brand-500 | Hover state for brand solid |
| `bg-bg-brand-solid-active` | `--color-bg-brand-solid_active` | brand-800 | brand-400 | Active/pressed state |
| `bg-bg-brand-solid-disabled` | `--color-bg-brand-solid_disabled` | brand-200 | brand-800 | Disabled brand button |

**Examples:**

```tsx
<button className="
  bg-bg-brand-solid 
  hover:bg-bg-brand-solid-hover 
  active:bg-bg-brand-solid-active
  disabled:bg-bg-brand-solid-disabled
">
  Primary Button
</button>

<div className="bg-bg-brand-secondary rounded-lg p-4">
  Brand callout box
</div>
```

### Error Backgrounds

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `bg-bg-error` | `--color-bg-error` | Error background (subtle) |
| `bg-bg-error-solid` | `--color-bg-error-solid` | Solid error buttons/badges |
| `bg-bg-error-solid-hover` | `--color-bg-error-solid_hover` | Hover state |
| `bg-bg-error-solid-active` | `--color-bg-error-solid_active` | Active state |
| `bg-bg-error-solid-disabled` | `--color-bg-error-solid_disabled` | Disabled state |

**Examples:**

```tsx
<div className="bg-bg-error border border-border-error rounded-lg p-4">
  <p className="text-text-error">Error message here</p>
</div>

<button className="
  bg-bg-error-solid 
  text-white
  hover:bg-bg-error-solid-hover
">
  Delete
</button>
```

### Warning & Success Backgrounds

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `bg-bg-warning` | `--color-bg-warning` | Warning backgrounds |
| `bg-bg-warning-solid` | `--color-bg-warning-solid` | Solid warning buttons |
| `bg-bg-warning-solid-hover` | `--color-bg-warning-solid_hover` | Hover state |
| `bg-bg-warning-solid-active` | `--color-bg-warning-solid_active` | Active state |
| `bg-bg-warning-solid-disabled` | `--color-bg-warning-solid_disabled` | Disabled state |
| `bg-bg-success` | `--color-bg-success` | Success backgrounds |
| `bg-bg-success-solid` | `--color-bg-success-solid` | Solid success buttons |
| `bg-bg-success-solid-hover` | `--color-bg-success-solid_hover` | Hover state |
| `bg-bg-success-solid-active` | `--color-bg-success-solid_active` | Active state |
| `bg-bg-success-solid-disabled` | `--color-bg-success-solid_disabled` | Disabled state |

---

## Border Tokens

Border tokens are used for borders, dividers, and outlines. Use the `border-` utility class.

### Hierarchy Tokens

| Token | CSS Variable | Light Mode | Dark Mode | Usage |
|-------|--------------|------------|-----------|-------|
| `border-border-primary` | `--color-border-primary` | gray-200 | gray-800 | Standard borders, dividers |
| `border-border-secondary` | `--color-border-secondary` | gray-100 | gray-700 | Subtle borders |
| `border-border-tertiary` | `--color-border-tertiary` | gray-50 | gray-600 | Very subtle borders |
| `border-border-disabled` | `--color-border-disabled` | gray-200 | gray-800 | Disabled element borders |
| `border-border-disabled-subtle` | `--color-border-disabled_subtle` | gray-100 | gray-800 | Subtle disabled borders |

**Examples:**

```tsx
<div className="border border-border-primary rounded-lg">
  Standard border
</div>

<hr className="border-border-secondary" />
```

### Brand Borders

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `border-border-brand` | `--color-border-brand` | Brand colored borders |
| `border-border-brand-solid` | `--color-border-brand-solid` | Solid brand borders |
| `border-border-brand-solid-hover` | `--color-border-brand-solid_hover` | Hover state |
| `border-border-brand-solid-active` | `--color-border-brand-solid_active` | Active state |
| `border-border-brand-solid-disabled` | `--color-border-brand-solid_disabled` | Disabled state |
| `border-border-brand-alt` | `--color-border-brand_alt` | Alternative brand border |

**Examples:**

```tsx
<input 
  className="
    border border-border-primary
    focus:border-border-brand
  "
/>
```

### Error Borders

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `border-border-error` | `--color-border-error` | Error state borders |
| `border-border-error-solid` | `--color-border-error-solid` | Solid error borders |
| `border-border-error-subtle` | `--color-border-error_subtle` | Subtle error borders |
| `border-border-error-alt` | `--color-border-error_alt` | Alternative error border |

**Examples:**

```tsx
<input 
  className="border border-border-error"
  aria-invalid="true"
/>
```

---

## Foreground (Icon) Tokens

Foreground tokens are used for icons, badges, and decorative elements. Use the `text-` utility class with `fg-` tokens.

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `text-fg-quaternary` | `--color-text-quaternary` | Standard icon color |
| `text-fg-quaternary-hover` | `--color-text-tertiary` | Hover state for icons |
| `text-fg-disabled` | `--color-text-disabled` | Disabled icons |
| `text-fg-disabled-subtle` | `--color-text-disabled` | Subtle disabled icons |
| `text-fg-white` | `#ffffff` | White icons |
| `text-fg-brand-primary` | `--color-text-brand` | Brand colored icons |
| `text-fg-brand-secondary` | `--color-text-brand-secondary` | Secondary brand icons |
| `text-fg-brand-secondary-hover` | `--color-text-brand` | Hover state |
| `text-fg-error-primary` | `--color-text-error` | Error icons |
| `text-fg-error-secondary` | `--color-text-error-secondary` | Secondary error icons |
| `text-fg-success-primary` | `--color-text-success` | Success icons |
| `text-fg-success-secondary` | `--color-text-success-secondary` | Secondary success icons |
| `text-fg-warning-primary` | `--color-text-warning` | Warning icons |
| `text-fg-warning-secondary` | `--color-text-warning-secondary` | Secondary warning icons |

**Examples:**

```tsx
<button className="flex items-center gap-2">
  <Icon className="text-fg-quaternary hover:text-fg-quaternary-hover" />
  <span>Button Text</span>
</button>

<AlertCircle className="text-fg-error-primary" />
<CheckCircle className="text-fg-success-primary" />
```

---

## Color Primitives

Direct access to base color scales (use sparingly - prefer semantic tokens):

### Gray Scale
- `gray-25` through `gray-950` (11 shades)

### Brand Colors
- `brand-25` through `brand-950` (11 shades)

### Semantic Colors
- `error-25` through `error-950`
- `warning-25` through `warning-950`
- `success-25` through `success-950`

### Extended Palette
- `blue`, `indigo`, `purple`, `pink`, `rose`
- `orange`, `yellow`, `lime`, `green`, `emerald`
- `teal`, `cyan`, `sky`, `violet`, `fuchsia`
- `slate`, `zinc`, `stone`, `neutral`

**Usage:**

```tsx
// ⚠️  Use semantic tokens when possible
<div className="bg-bg-brand-solid"> ✅ Preferred</div>

// Only use primitives for custom one-offs
<div className="bg-brand-600"> ⚠️  Direct primitive</div>
```

---

## Usage Guidelines

### When to Use Each Token Type

#### Text Tokens (`text-text-*`)
- ✅ Body copy, headings, labels
- ✅ Links and interactive text
- ✅ Error/success messages
- ❌ Icons (use `fg-` tokens instead)

#### Background Tokens (`bg-bg-*`)
- ✅ Cards, modals, panels
- ✅ Buttons and interactive elements
- ✅ Page backgrounds
- ❌ Text (use `text-` tokens instead)

#### Border Tokens (`border-border-*`)
- ✅ Component borders
- ✅ Dividers and separators
- ✅ Input field outlines
- ✅ Focus rings (with focus: modifier)

#### Foreground Tokens (`text-fg-*`)
- ✅ Icons and icon buttons
- ✅ Badges and status indicators
- ✅ Decorative elements
- ❌ Body text (use `text-` tokens instead)

### Semantic vs Primitive Tokens

**✅ DO: Use Semantic Tokens**
```tsx
<button className="bg-bg-brand-solid text-text-on-brand">
  Button
</button>
```

**❌ DON'T: Use Primitives Directly**
```tsx
<button className="bg-brand-600 text-white">
  Button
</button>
```

**Why?** Semantic tokens:
- Adapt to dark mode automatically
- Can be updated globally
- Provide better context and meaning
- Follow industry standards

### Component Patterns

#### Button (Primary)
```tsx
<button className="
  bg-bg-brand-solid 
  text-text-on-brand
  border border-transparent
  hover:bg-bg-brand-solid-hover
  active:bg-bg-brand-solid-active
  disabled:bg-bg-brand-solid-disabled
  disabled:cursor-not-allowed
">
  Primary Action
</button>
```

#### Button (Secondary)
```tsx
<button className="
  bg-bg-secondary
  text-text-primary
  border border-border-primary
  hover:bg-bg-tertiary
  active:bg-bg-quaternary
">
  Secondary Action
</button>
```

#### Button (Ghost)
```tsx
<button className="
  bg-transparent
  text-text-secondary
  hover:bg-bg-secondary
  hover:text-text-primary
">
  Ghost Button
</button>
```

#### Input Field
```tsx
<input className="
  w-full
  bg-bg-primary
  text-text-primary
  border border-border-primary
  placeholder:text-text-placeholder
  focus:border-border-brand
  focus:ring-2
  focus:ring-bg-brand-secondary
  disabled:bg-bg-disabled
  disabled:text-text-disabled
  disabled:border-border-disabled
  disabled:cursor-not-allowed
" />
```

#### Card
```tsx
<div className="
  bg-bg-primary
  border border-border-primary
  rounded-lg
  p-6
  hover:bg-bg-secondary
  transition-colors
">
  <h3 className="text-text-primary font-semibold mb-2">
    Card Title
  </h3>
  <p className="text-text-secondary">
    Card content goes here
  </p>
</div>
```

---

## Dark Mode Behavior

All tokens automatically adapt to dark mode. No additional classes needed!

### Light Mode Values
- Backgrounds: White → Gray shades
- Text: Dark → Light
- Borders: Gray-200 → Gray-800

### Dark Mode Values  
- Backgrounds: Gray-950 → Gray-800
- Text: Light → Gray-25
- Borders: Gray-800 → Gray-700

**Example:**

```tsx
// This automatically works in both themes
<div className="bg-bg-primary text-text-primary border border-border-primary">
  Content adapts automatically to light/dark mode
</div>
```

### Testing Dark Mode

```tsx
// Toggle dark mode in your app
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</button>
```

---

## Token Naming Convention

Untitled UI follows this structure:

```
{utility}-{category}-{variant}-{state}
```

**Examples:**
- `text-text-primary` → Text utility, text category, primary variant
- `bg-bg-brand-solid-hover` → Background utility, bg category, brand-solid variant, hover state
- `border-border-error` → Border utility, border category, error variant

### Why Double Prefixes?

You might notice patterns like `text-text-primary` or `bg-bg-primary`. This is intentional:

- **First prefix**: Tailwind utility class (`text-`, `bg-`, `border-`)
- **Second prefix**: Token category (`text-`, `bg-`, `border-`)

This prevents naming conflicts and makes token purpose crystal clear.

---

## Quick Reference Cheat Sheet

### Most Common Tokens

```tsx
// Text
text-text-primary        // Main text
text-text-secondary      // Supporting text
text-text-tertiary       // Subtle text
text-text-brand          // Brand links

// Backgrounds
bg-bg-primary            // Main background
bg-bg-secondary          // Subtle background
bg-bg-brand-solid        // Brand buttons
bg-bg-error              // Error backgrounds

// Borders
border-border-primary    // Standard borders
border-border-brand      // Focus states
border-border-error      // Error borders
```

---

## Additional Resources

- [Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md) - How to migrate from legacy tokens
- [Tailwind Config](../../tailwind.config.ts) - Complete token definitions
- [Theme CSS](../../src/styles/theme.css) - CSS variable definitions
- [Untitled UI Documentation](https://www.untitledui.com/) - Official design system docs

---

**Questions or Issues?**  
Open an issue in the repository or contact the design system team.

**Last Updated**: October 2025

