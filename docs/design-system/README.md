# Design System Documentation

> **Comprehensive design token system aligned with Untitled UI standards**

## 📚 Documentation Index

### Core Documentation

1. **[Token Reference Guide](./UNTITLED_UI_TOKEN_REFERENCE.md)** ⭐  
   Complete catalog of all available design tokens with usage examples.  
   👉 *Start here for quick token lookups*

2. **[Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md)**  
   Step-by-step guide for migrating from legacy tokens to Untitled UI standard names.  
   👉 *Essential reading for developers updating existing components*

3. **[Alignment Audit Report](./UNTITLED_UI_ALIGNMENT_AUDIT_REPORT.md)**  
   Comprehensive audit documenting our 100% compliance with Untitled UI.  
   👉 *Reference for understanding system architecture*

---

## 🚀 Quick Start

### For New Components (Use Untitled UI Tokens)

```tsx
import React from 'react';

export function MyComponent() {
  return (
    <div className="bg-bg-primary border border-border-primary rounded-lg p-6">
      <h2 className="text-text-primary font-semibold mb-2">
        Component Title
      </h2>
      <p className="text-text-secondary mb-4">
        Supporting description text
      </p>
      <button className="
        bg-bg-brand-solid 
        text-text-on-brand
        hover:bg-bg-brand-solid-hover
        active:bg-bg-brand-solid-active
        disabled:bg-bg-brand-solid-disabled
        px-4 py-2 rounded-lg
      ">
        Call to Action
      </button>
    </div>
  );
}
```

### For Existing Components (Legacy Still Works)

```tsx
// ⚠️ This still works but is deprecated
<div className="bg-background text-primary border border-border">
  Legacy tokens continue to function
</div>

// ✅ Migrate to this when you can
<div className="bg-bg-primary text-text-primary border border-border-primary">
  Untitled UI standard tokens
</div>
```

---

## 🎨 Token Categories

### Text Tokens
Use for text content and typography.

```tsx
className="text-text-primary"      // Main text
className="text-text-secondary"    // Supporting text
className="text-text-tertiary"     // Subtle text
className="text-text-brand"        // Brand colored text
className="text-text-error"        // Error messages
```

### Background Tokens
Use for component backgrounds.

```tsx
className="bg-bg-primary"           // Main background
className="bg-bg-secondary"         // Subtle contrast
className="bg-bg-brand-solid"       // Brand buttons
className="bg-bg-error"             // Error backgrounds
```

### Border Tokens
Use for borders and dividers.

```tsx
className="border-border-primary"   // Standard borders
className="border-border-brand"     // Brand borders
className="border-border-error"     // Error borders
```

### Foreground (Icon) Tokens
Use for icons and decorative elements.

```tsx
className="text-fg-quaternary"      // Standard icons
className="text-fg-brand-primary"   // Brand icons
className="text-fg-error-primary"   // Error icons
```

---

## 🌗 Dark Mode Support

All tokens automatically adapt to dark mode! No additional classes needed.

```tsx
// Works in both light and dark mode automatically
<div className="bg-bg-primary text-text-primary">
  Content adapts to theme
</div>
```

To toggle dark mode in your app:

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

---

## 🎯 Common Patterns

### Button Patterns

```tsx
// Primary Button
<button className="bg-bg-brand-solid text-text-on-brand hover:bg-bg-brand-solid-hover">
  Primary
</button>

// Secondary Button  
<button className="bg-bg-secondary text-text-primary hover:bg-bg-tertiary">
  Secondary
</button>

// Ghost Button
<button className="bg-transparent text-text-secondary hover:bg-bg-secondary">
  Ghost
</button>

// Error Button
<button className="bg-bg-error-solid text-text-on-brand hover:bg-bg-error-solid-hover">
  Delete
</button>
```

### Input Fields

```tsx
<input className="
  w-full
  bg-bg-primary
  text-text-primary
  border border-border-primary
  placeholder:text-text-placeholder
  focus:border-border-brand
  disabled:bg-bg-disabled
  disabled:text-text-disabled
" />
```

### Cards

```tsx
<div className="bg-bg-primary border border-border-primary rounded-lg p-6 hover:bg-bg-secondary">
  <h3 className="text-text-primary font-semibold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

### Alert/Banner Patterns

```tsx
// Error Alert
<div className="bg-bg-error border border-border-error rounded-lg p-4">
  <p className="text-text-error">Error message</p>
</div>

// Success Alert
<div className="bg-bg-success border border-border-success rounded-lg p-4">
  <p className="text-text-success">Success message</p>
</div>

// Warning Alert
<div className="bg-bg-warning border border-border-warning rounded-lg p-4">
  <p className="text-text-warning">Warning message</p>
</div>
```

---

## 📖 Token Naming Convention

Untitled UI tokens follow this structure:

```
{utility}-{category}-{variant}-{state}
```

**Examples:**
- `text-text-primary` → Text utility, text category, primary variant
- `bg-bg-brand-solid-hover` → Background utility, bg category, brand-solid variant, hover state
- `border-border-error` → Border utility, border category, error variant

### Why Double Prefixes?

You'll notice patterns like `text-text-primary` or `bg-bg-primary`:

- **First prefix**: Tailwind utility class (`text-`, `bg-`, `border-`)
- **Second prefix**: Token category designation
- This prevents naming conflicts and provides clarity

---

## 🔄 Migration Status

### Current Phase: Dual Token System (Phase 1)

Both legacy and Untitled UI tokens are available:

| Phase | Timeline | Status | Description |
|-------|----------|--------|-------------|
| **Phase 1** | Current - 6 months | ✅ Active | Both systems available |
| **Phase 2** | Months 7-12 | 📝 Planned | ESLint warnings added |
| **Phase 3** | After 12 months | 📝 Planned | Legacy tokens removed |

### What This Means

- ✅ **New code**: Use Untitled UI standard tokens
- ✅ **Existing code**: Continues to work without changes
- ✅ **Migration**: Gradual, non-breaking transition
- ⚠️ **Legacy tokens**: Marked as deprecated but functional

---

## 📊 System Statistics

| Metric | Value |
|--------|-------|
| Total Design Tokens | 143+ |
| Text Tokens | 17 |
| Background Tokens | 26 |
| Border Tokens | 16 |
| Foreground Tokens | 14 |
| Color Primitives | 200+ |
| Documentation Pages | 3 |
| Untitled UI Compliance | 100% |

---

## 🛠️ Development Tools

### Token Lookup

Need to find a specific token? Use the search feature in your editor:

```bash
# Search for text tokens
grep -r "text-text-" docs/design-system/

# Search for background tokens
grep -r "bg-bg-" docs/design-system/

# Search for border tokens
grep -r "border-border-" docs/design-system/
```

### VS Code Snippets (Coming Soon)

We're working on VS Code snippets for common token patterns:

```json
{
  "Untitled UI Button": {
    "prefix": "ui-button",
    "body": [
      "<button className=\"bg-bg-brand-solid text-text-on-brand hover:bg-bg-brand-solid-hover\">",
      "  ${1:Button Text}",
      "</button>"
    ]
  }
}
```

---

## 🎓 Learning Resources

### Internal Documentation
- [Token Reference](./UNTITLED_UI_TOKEN_REFERENCE.md) - Complete token catalog
- [Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md) - How to migrate
- [Audit Report](./UNTITLED_UI_ALIGNMENT_AUDIT_REPORT.md) - System architecture

### Configuration Files
- `tailwind.config.ts` - Tailwind token definitions
- `src/styles/theme.css` - CSS variable definitions
- `src/styles/globals.css` - Global styles and utilities

### External Resources
- [Untitled UI Website](https://www.untitledui.com/) - Official design system
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Tailwind documentation
- [Design Tokens Community](https://www.designtokens.org/) - Industry standards

---

## ❓ FAQ

### Q: Which tokens should I use for new components?

**A:** Always use Untitled UI standard tokens (e.g., `text-text-primary`, `bg-bg-primary`). See the [Token Reference](./UNTITLED_UI_TOKEN_REFERENCE.md).

### Q: What happens to my existing components?

**A:** They continue to work! Legacy tokens remain functional during the transition period.

### Q: How do I migrate an existing component?

**A:** Follow the [Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md) for step-by-step instructions and examples.

### Q: Do tokens work in dark mode?

**A:** Yes! All tokens automatically adapt to dark mode via CSS variables.

### Q: Can I use color primitives directly?

**A:** You can, but prefer semantic tokens (e.g., use `bg-bg-brand-solid` instead of `bg-brand-600`).

### Q: Where can I see all available tokens?

**A:** Check the [Token Reference Guide](./UNTITLED_UI_TOKEN_REFERENCE.md) for a complete catalog.

### Q: How do I report issues or suggest improvements?

**A:** Open an issue in the repository or contact the design system team.

---

## 🤝 Contributing

### Adding New Tokens

If you need a token that doesn't exist:

1. Check if an existing token can serve your use case
2. Consult the [Untitled UI documentation](https://www.untitledui.com/)
3. If truly needed, propose it to the design system team
4. Update `tailwind.config.ts` and documentation

### Updating Documentation

Help keep documentation accurate:

1. Fix typos or outdated information
2. Add examples for common use cases
3. Improve clarity and readability
4. Submit a pull request

---

## 📞 Support

### Getting Help

- 📚 **Documentation**: Start with the [Token Reference](./UNTITLED_UI_TOKEN_REFERENCE.md)
- 🐛 **Issues**: Open an issue in the repository
- 💬 **Questions**: Reach out to the design system team
- 🔧 **Code Examples**: Check the [Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md)

### Design System Team

For questions about tokens, migration, or design system architecture:

- Check existing documentation first
- Search closed issues for similar questions
- Open a new issue with the `design-system` label
- Include code examples and context

---

## 🗺️ Roadmap

### Completed ✅
- [x] Full Untitled UI token alignment
- [x] Dual token system implementation
- [x] Comprehensive documentation
- [x] Dark mode support
- [x] State variant tokens

### In Progress 🚧
- [ ] ESLint rules for token usage
- [ ] VS Code snippets
- [ ] Automated migration scripts
- [ ] Component library updates

### Planned 📝
- [ ] Figma design file updates
- [ ] Storybook token documentation
- [ ] Performance monitoring
- [ ] Legacy token removal (after 12 months)

---

## 📜 Version History

### v2.0.0 - October 2025 (Current)
- ✅ Added 143 Untitled UI standard tokens
- ✅ Implemented dual token system
- ✅ Created comprehensive documentation
- ✅ 100% Untitled UI compliance achieved

### v1.0.0 - Previous
- Legacy token system
- Custom naming conventions
- Limited semantic tokens

---

**Last Updated**: October 19, 2025  
**Maintained By**: Design System Team  
**Status**: ✅ Active & Maintained

