# 🚀 Quick Start Guide

## Your New Component Structure

```
src/components/
│
├── ui/                  ✅ Untitled UI Design System
│   ├── button.tsx      Import: import { Button } from '@/components/ui'
│   ├── input.tsx
│   └── checkbox.tsx
│
├── foundations/         ✅ Design Foundations
│   └── dot-icon.tsx    Import: import { DotIcon } from '@/components/foundations'
│
├── atoms/              ✅ Custom Atoms
│   ├── Avatar.tsx      Import: import { Avatar } from '@/components/atoms'
│   └── StarRating.tsx
│
├── molecules/          ✅ Molecules
│   ├── UserCard.tsx    Import: import { UserCard } from '@/components/molecules'
│   └── FormItem.tsx
│
└── organisms/          ✅ Organisms
    ├── Header/         Import: import { Header } from '@/components/organisms'
    └── Footer.tsx
```

---

## 📥 How to Import

### Copy-paste this template:

```tsx
// Untitled UI components - ALWAYS import from here
import { Button, Input, Checkbox } from '@/components/ui';

// Design foundations
import { DotIcon } from '@/components/foundations';

// Your custom components
import { Avatar, StarRating } from '@/components/atoms';
import { UserCard, FormItem } from '@/components/molecules';
import { Header, Footer } from '@/components/organisms';
```

---

## ⚠️ CRITICAL: Fix Your Existing Code

Some files are still importing Button/Input from the wrong place!

### Find & Replace:

**OLD (Wrong):**
```tsx
import { Button, Input } from '@/components/atoms';
```

**NEW (Correct):**
```tsx
import { Button, Input } from '@/components/ui';
```

### Search in your project for:
- `from '@/components/atoms'` → Check if it imports Button/Input/Checkbox
- Update those to use `from '@/components/ui'`

---

## 📖 Full Documentation

1. **Start Here:** [`README.md`](./README.md) - Quick reference
2. **Detailed Guide:** [`COMPONENT_STRUCTURE.md`](./COMPONENT_STRUCTURE.md)
3. **Code Examples:** [`IMPORT_EXAMPLES.tsx`](./IMPORT_EXAMPLES.tsx)
4. **Visual Diagrams:** [`ARCHITECTURE_DIAGRAM.md`](./ARCHITECTURE_DIAGRAM.md)
5. **What Changed:** [`../COMPONENT_RESTRUCTURE_SUMMARY.md`](../COMPONENT_RESTRUCTURE_SUMMARY.md)
6. **Todo List:** [`../RESTRUCTURE_CHECKLIST.md`](../RESTRUCTURE_CHECKLIST.md)

---

## 🎯 Next Steps

1. ✅ Read this guide
2. ⬜ Update imports in your pages (see "Find & Replace" above)
3. ⬜ Test your app
4. ⬜ Add more UI components (table, select, modal)

---

## ✅ You're All Set!

Your component structure is now organized and ready to use with Untitled UI! 🎉

