# Design Tokens Migration Guide

> **Migration Strategy**: Dual Token System with Gradual Migration  
> **Target Standard**: Untitled UI Design Token Conventions  
> **Status**: ✅ Both legacy and Untitled UI tokens are now available

## Overview

This guide helps you migrate from our legacy shorthand token names to Untitled UI standard naming conventions. Both naming systems are currently supported, allowing for a gradual, non-breaking migration.

## Why Migrate?

1. **Industry Standard**: Untitled UI is a widely-adopted design system with excellent documentation
2. **Better Clarity**: Standard names like `text-primary` are more explicit than `primary`
3. **Improved Maintainability**: Consistent naming across text, background, and border tokens
4. **Team Collaboration**: Easier for designers and developers familiar with Untitled UI
5. **Future-Proof**: Aligns with design system best practices

## Migration Strategy

### ✅ Phase 1: Dual System (Current - 6 months)
- Both legacy and Untitled UI tokens are available
- All new code MUST use Untitled UI standard names
- Existing code continues to work without changes
- Gradual migration during regular maintenance

### 📝 Phase 2: Deprecation Warnings (Months 7-12)
- ESLint rules to warn about legacy token usage
- Automated refactoring scripts available
- Documentation updates to remove legacy references

### 🚫 Phase 3: Legacy Removal (After 12 months)
- Remove legacy token names from Tailwind config
- All code uses Untitled UI standard tokens

## Token Migration Table

### Text Tokens

| ❌ Legacy (DEPRECATED) | ✅ Untitled UI Standard | Usage |
|----------------------|------------------------|-------|
| `text-primary` | `text-text-primary` | Primary body text, headings |
| `text-secondary` | `text-text-secondary` | Supporting text, labels |
| `text-tertiary` | `text-text-tertiary` | Captions, metadata, hints |
| `text-quaternary` | `text-text-quaternary` | Very subtle text |
| `text-disabled` | `text-text-disabled` | Disabled state text |
| `text-placeholder` | `text-text-placeholder` | Input placeholders |
| `text-placeholder_subtle` | `text-text-placeholder-subtle` | Subtle placeholders |
| N/A | `text-text-brand` | Brand colored text (NEW) |
| N/A | `text-text-error` | Error messages (NEW) |
| N/A | `text-text-warning` | Warning messages (NEW) |
| N/A | `text-text-success` | Success messages (NEW) |
| N/A | `text-text-on-brand` | Text on brand backgrounds (NEW) |

### Background Tokens

| ❌ Legacy (DEPRECATED) | ✅ Untitled UI Standard | Usage |
|----------------------|------------------------|-------|
| `bg-background` | `bg-bg-primary` | Main canvas background |
| `bg-secondary_bg` | `bg-bg-secondary` | Subtle background contrast |
| `bg-primary_hover` | `bg-bg-secondary` | Hover backgrounds |
| `bg-disabled_subtle` | `bg-bg-disabled` | Disabled elements |
| `bg-brand` | `bg-bg-brand` | Brand background (subtle) |
| N/A | `bg-bg-tertiary` | More contrast (NEW) |
| N/A | `bg-bg-quaternary` | Highest contrast (NEW) |
| N/A | `bg-bg-brand-solid` | Solid brand buttons (NEW) |
| N/A | `bg-bg-brand-solid-hover` | Button hover state (NEW) |
| N/A | `bg-bg-error-solid` | Error buttons (NEW) |
| N/A | `bg-bg-success` | Success backgrounds (NEW) |
| N/A | `bg-bg-warning` | Warning backgrounds (NEW) |

### Border Tokens

| ❌ Legacy (DEPRECATED) | ✅ Untitled UI Standard | Usage |
|----------------------|------------------------|-------|
| `border-border` | `border-border-primary` | Standard borders, dividers |
| `border-disabled_border` | `border-border-disabled` | Disabled element borders |
| N/A | `border-border-secondary` | Subtle borders (NEW) |
| N/A | `border-border-tertiary` | Very subtle borders (NEW) |
| N/A | `border-border-brand` | Brand colored borders (NEW) |
| N/A | `border-border-error` | Error state borders (NEW) |
| N/A | `border-border-error-subtle` | Subtle error borders (NEW) |

### Foreground (Icon) Tokens

Most `fg-` tokens already follow Untitled UI conventions! Just replace underscores with hyphens:

| ❌ Legacy | ✅ Untitled UI Standard |
|----------|------------------------|
| `text-fg-quaternary_hover` | `text-fg-quaternary-hover` |
| `text-fg-disabled_subtle` | `text-fg-disabled-subtle` |
| `text-fg-brand-secondary_alt` | `text-fg-brand-secondary` |

## Code Examples

### Before (Legacy) ❌

```tsx
<div className="bg-background border border-border">
  <h1 className="text-primary">Heading</h1>
  <p className="text-secondary">Supporting text</p>
  <button className="bg-brand text-white hover:bg-primary_hover">
    Button
  </button>
</div>
```

### After (Untitled UI) ✅

```tsx
<div className="bg-bg-primary border border-border-primary">
  <h1 className="text-text-primary">Heading</h1>
  <p className="text-text-secondary">Supporting text</p>
  <button className="bg-bg-brand-solid text-white hover:bg-bg-brand-solid-hover">
    Button
  </button>
</div>
```

## State Variants - NEW! 🎉

Untitled UI tokens now include state-specific variants for better semantic meaning:

### Hover States

```tsx
// ❌ Before: Generic hover with Tailwind modifier
<button className="bg-brand hover:bg-secondary_bg">Button</button>

// ✅ After: Semantic hover token
<button className="bg-bg-brand-solid hover:bg-bg-brand-solid-hover">Button</button>
```

### Active States

```tsx
// ✅ New semantic active state
<button className="bg-bg-brand-solid active:bg-bg-brand-solid-active">
  Button
</button>
```

### Disabled States

```tsx
// ❌ Before: Manual disabled styling
<button disabled className="bg-brand opacity-50 cursor-not-allowed">
  Button
</button>

// ✅ After: Semantic disabled token
<button disabled className="bg-bg-brand-solid-disabled cursor-not-allowed">
  Button
</button>
```

## Component-Specific Patterns

### Buttons

```tsx
// Primary Button
<button className="bg-bg-brand-solid text-text-on-brand hover:bg-bg-brand-solid-hover active:bg-bg-brand-solid-active disabled:bg-bg-brand-solid-disabled">
  Primary Action
</button>

// Error Button
<button className="bg-bg-error-solid text-text-on-brand hover:bg-bg-error-solid-hover">
  Delete
</button>

// Success Button
<button className="bg-bg-success-solid text-text-on-brand hover:bg-bg-success-solid-hover">
  Confirm
</button>
```

### Input Fields

```tsx
<div className="space-y-2">
  <label className="text-text-secondary font-medium">Email</label>
  <input
    type="email"
    placeholder="you@example.com"
    className="
      w-full
      bg-bg-primary
      border border-border-primary
      text-text-primary
      placeholder:text-text-placeholder
      focus:border-border-brand
      disabled:bg-bg-disabled
      disabled:border-border-disabled
      disabled:text-text-disabled
    "
  />
  <p className="text-text-tertiary text-sm">Helper text goes here</p>
</div>
```

### Cards

```tsx
<div className="bg-bg-primary border border-border-primary rounded-lg p-6 hover:bg-bg-secondary">
  <h3 className="text-text-primary font-semibold mb-2">Card Title</h3>
  <p className="text-text-secondary mb-4">Card description goes here.</p>
  <div className="flex items-center gap-2 text-text-tertiary text-sm">
    <Icon className="text-fg-quaternary" />
    <span>Metadata</span>
  </div>
</div>
```

### Error States

```tsx
<div className="bg-bg-error border border-border-error rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="text-fg-error-primary" />
    <div>
      <h4 className="text-text-error font-medium">Error occurred</h4>
      <p className="text-text-error-secondary text-sm">Please try again.</p>
    </div>
  </div>
</div>
```

### Success States

```tsx
<div className="bg-bg-success border border-border-success rounded-lg p-4">
  <p className="text-text-success">Operation completed successfully!</p>
</div>
```

## Dark Mode Considerations

All Untitled UI tokens automatically adapt to dark mode via CSS variables. No additional classes needed!

```tsx
// ✅ Works in both light and dark mode
<div className="bg-bg-primary text-text-primary border border-border-primary">
  Content automatically adapts to theme
</div>
```

## Automated Migration Tools

### Find and Replace Script

Use this regex pattern in your editor to find legacy usages:

```regex
// Find legacy text tokens
\btext-(primary|secondary|tertiary|quaternary|disabled|placeholder)\b

// Find legacy background tokens  
\bbg-(background|secondary_bg|primary_hover|disabled_subtle|brand)\b

// Find legacy border tokens
\bborder-(border|disabled_border)\b
```

### ESLint Rule (Coming Soon)

We're developing custom ESLint rules to automatically detect legacy token usage:

```js
// .eslintrc.js
rules: {
  'design-system/use-untitled-ui-tokens': 'warn'
}
```

## Migration Checklist

Use this checklist when migrating components:

- [ ] Replace all `text-primary` → `text-text-primary`
- [ ] Replace all `text-secondary` → `text-text-secondary`
- [ ] Replace all `bg-background` → `bg-bg-primary`
- [ ] Replace all `bg-secondary_bg` → `bg-bg-secondary`
- [ ] Replace all `bg-brand` → `bg-bg-brand-solid` (for buttons)
- [ ] Replace all `border-border` → `border-border-primary`
- [ ] Add semantic state variants (hover, active, disabled)
- [ ] Use semantic error/warning/success tokens where appropriate
- [ ] Test in both light and dark mode
- [ ] Update component documentation

## FAQ

### Q: Do I need to update my components immediately?

**A:** No! Both systems work side-by-side. Update components gradually during regular maintenance or when touching code for other reasons.

### Q: What if I use the wrong token name?

**A:** No worries! If you accidentally use a legacy token, it will still work. However, you'll see deprecation warnings in the config file comments.

### Q: Can I mix legacy and new tokens in the same file?

**A:** Yes, but it's not recommended. Try to be consistent within each component.

### Q: How long until legacy tokens are removed?

**A:** At least 12 months from the introduction of the dual system. You'll receive plenty of advance notice.

### Q: What about third-party components?

**A:** Third-party components will continue to work. Update them to use Untitled UI tokens when you have time.

### Q: Are there performance differences?

**A:** No performance difference whatsoever. Both systems point to the same CSS variables.

## Getting Help

- 📚 **Token Reference**: See [UNTITLED_UI_TOKEN_REFERENCE.md](./UNTITLED_UI_TOKEN_REFERENCE.md)
- 🔧 **Tailwind Config**: See `tailwind.config.ts` for all available tokens
- 💬 **Questions**: Open an issue or reach out to the design system team

## Related Documentation

- [Untitled UI Token Reference](./UNTITLED_UI_TOKEN_REFERENCE.md)
- [Tailwind Configuration](../../tailwind.config.ts)
- [Theme CSS Variables](../../src/styles/theme.css)
- [Component Examples](../examples/)

---

**Last Updated**: October 2025  
**Status**: ✅ Active Migration Period  
**Next Review**: April 2026 (Deprecation Warnings Phase)

