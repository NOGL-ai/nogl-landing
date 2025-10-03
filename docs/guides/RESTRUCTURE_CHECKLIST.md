# Component Restructure Checklist ✅

## ✅ Completed

- [x] **Cleaned up `atoms/index.ts`**
  - Removed re-exports of Button, Input, Badge from UI
  - Added documentation comment
  - Now only exports custom atoms

- [x] **Created `foundations/index.ts`**
  - Exports DotIcon
  - Ready for design tokens

- [x] **Fixed export in `foundations/index.ts`**
  - Correctly exports `Dot as DotIcon`

- [x] **Created comprehensive documentation**
  - `README.md` - Quick reference
  - `COMPONENT_STRUCTURE.md` - Full guide
  - `IMPORT_EXAMPLES.tsx` - Code examples
  - `ARCHITECTURE_DIAGRAM.md` - Visual structure
  - `COMPONENT_RESTRUCTURE_SUMMARY.md` - Summary

## 📋 Next Steps (Do These!)

### 1. Update Existing Imports (CRITICAL)

Find and replace old imports across your codebase:

```bash
# Search for files importing Button/Input from atoms
# They need to be updated to import from ui instead
```

**Files to check:**
- [ ] All pages in `src/app/(site)/[lang]/`
- [ ] Components that use Button/Input/Checkbox
- [ ] Form components
- [ ] Auth components (Signin, Signup)
- [ ] Dashboard components

**Old (Wrong):**
```tsx
import { Button } from '@/components/atoms';
```

**New (Correct):**
```tsx
import { Button } from '@/components/ui';
```

---

### 2. Add More UI Components

Create these Untitled UI components:

- [ ] `ui/table.tsx` - Data tables
- [ ] `ui/select.tsx` - Dropdown selects
- [ ] `ui/dropdown.tsx` - Dropdown menus
- [ ] `ui/modal.tsx` - Modal dialogs
- [ ] `ui/tooltip.tsx` - Tooltips
- [ ] `ui/card.tsx` - Card containers
- [ ] `ui/badge.tsx` - Badges/tags
- [ ] `ui/alert.tsx` - Alert messages
- [ ] `ui/toast.tsx` - Toast notifications
- [ ] `ui/tabs.tsx` - Tab navigation

**Template for new UI component:**
```tsx
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    // Implementation
    return <div ref={ref} className={cn(/* classes */)} {...props} />;
  }
);

Component.displayName = 'Component';
```

---

### 3. Organize Foundations

Create design token files:

- [ ] `foundations/colors.ts` - Color palette
```tsx
export const colors = {
  primary: {
    50: '#...',
    100: '#...',
    // ...
  },
  // ...
};
```

- [ ] `foundations/typography.ts` - Font scales
```tsx
export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    // ...
  },
  // ...
};
```

- [ ] `foundations/spacing.ts` - Spacing scale
```tsx
export const spacing = {
  0: '0',
  1: '0.25rem',
  // ...
};
```

- [ ] `foundations/icons/` - More icon components

---

### 4. Audit Components

Check each component folder:

**Atoms** (Should be simple, single-purpose):
- [ ] Review each atom - is it truly atomic?
- [ ] Move complex atoms to molecules if needed
- [ ] Ensure no business logic

**Molecules** (Should combine atoms/UI):
- [ ] Check they use atoms and UI components
- [ ] Verify they're not too complex (move to organisms if so)
- [ ] Ensure proper composition

**Organisms** (Can be complex):
- [ ] Verify they contain business logic if needed
- [ ] Check they're not too simple (move to molecules if so)
- [ ] Ensure proper use of lower layers

---

## 🔍 How to Find Files Needing Updates

### Option 1: Using grep/search
```bash
# In your project root
grep -r "from '@/components/atoms'" src/
grep -r "from '../atoms'" src/
grep -r 'from "../../atoms"' src/
```

### Option 2: Using VS Code
1. Press `Ctrl+Shift+F` (Windows) or `Cmd+Shift+F` (Mac)
2. Search for: `from '@/components/atoms'`
3. Check each file to see if it imports Button, Input, or Badge
4. Update those imports to use `'@/components/ui'`

---

## ✅ Quick Import Reference

Keep this handy while refactoring:

```tsx
// ✅ Untitled UI components
import { Button, Input, Checkbox } from '@/components/ui';

// ✅ Foundations (icons, tokens)
import { DotIcon } from '@/components/foundations';

// ✅ Custom atoms
import { Avatar, StarRating, Label } from '@/components/atoms';

// ✅ Molecules
import { UserCard, FormItem } from '@/components/molecules';

// ✅ Organisms
import { Header, Footer, Features } from '@/components/organisms';
```

---

## 🎯 Priority Tasks

**High Priority (Do First):**
1. ✅ Update all imports of Button/Input/Checkbox to use `@/components/ui`
2. ⬜ Test that all pages still work correctly
3. ⬜ Fix any TypeScript errors that appear

**Medium Priority:**
4. ⬜ Add Table, Select, Modal to UI components
5. ⬜ Create design tokens in foundations

**Low Priority:**
6. ⬜ Audit all components for proper placement
7. ⬜ Add remaining UI components
8. ⬜ Create more comprehensive documentation

---

## 🧪 Testing After Updates

After updating imports, test these areas:
- [ ] Homepage loads correctly
- [ ] Sign in/Sign up forms work
- [ ] Dashboard pages render
- [ ] All buttons are clickable
- [ ] All forms submit correctly
- [ ] No console errors

---

## 📚 Documentation Files

Your new documentation:
1. **`src/components/README.md`** - Start here! Quick reference guide
2. **`src/components/COMPONENT_STRUCTURE.md`** - Detailed architecture
3. **`src/components/IMPORT_EXAMPLES.tsx`** - Code examples
4. **`src/components/ARCHITECTURE_DIAGRAM.md`** - Visual diagrams
5. **`COMPONENT_RESTRUCTURE_SUMMARY.md`** - What changed

---

## ⚠️ Common Issues & Solutions

### Issue: "Module has no exported member 'Button'"
**Solution:** You're trying to import Button from atoms. Change to:
```tsx
import { Button } from '@/components/ui';
```

### Issue: "Cannot find module '@/components/ui'"
**Solution:** Check that `ui/index.ts` exports the component:
```tsx
export { Button } from './button';
```

### Issue: TypeScript errors in components
**Solution:** Components may need props updated. Check the new Button/Input interfaces.

---

## 🎉 When You're Done

You'll have:
- ✅ Clean separation of UI vs custom components
- ✅ Clear import patterns
- ✅ Scalable architecture
- ✅ Type-safe components
- ✅ Better developer experience

Your codebase will be more maintainable and easier to understand! 🚀

---

## 💡 Need Help?

Refer to:
- `src/components/README.md` for quick answers
- `src/components/COMPONENT_STRUCTURE.md` for detailed guidance
- `src/components/IMPORT_EXAMPLES.tsx` for code examples

Good luck with the restructuring! 🎯

