# Component Architecture Diagram

## 🏗️ Visual Structure

```
┌───────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                        │
│                     (Pages, Layouts, etc.)                     │
└───────────────────────────────────────────────────────────────┘
                                ↓ imports from
┌───────────────────────────────────────────────────────────────┐
│                    🏛️ ORGANISMS LAYER                         │
│  Complex, feature-rich components with business logic         │
│                                                                │
│  📁 src/components/organisms/                                 │
│  ├── Header/              ├── Footer.tsx                      │
│  ├── Features.tsx         ├── SectionHowItWork.tsx           │
│  ├── Testimonials.tsx     └── SectionSubscribe2.tsx          │
│                                                                │
│  Import: import { Header, Footer } from '@/components/organisms' │
└───────────────────────────────────────────────────────────────┘
                                ↓ uses
┌───────────────────────────────────────────────────────────────┐
│                    🧩 MOLECULES LAYER                          │
│  Composite components made from atoms and UI components       │
│                                                                │
│  📁 src/components/molecules/                                 │
│  ├── UserCard.tsx         ├── FormItem.tsx                    │
│  ├── CategoryCard.tsx     ├── GallerySlider.tsx              │
│  ├── DatePicker*.tsx      └── ShareModal.tsx                  │
│                                                                │
│  Import: import { UserCard, FormItem } from '@/components/molecules' │
└───────────────────────────────────────────────────────────────┘
                                ↓ uses
┌───────────────────────────────────────────────────────────────┐
│                    ⚛️ ATOMS LAYER (Custom)                    │
│  Your custom smallest building blocks                         │
│                                                                │
│  📁 src/components/atoms/                                     │
│  ├── Avatar.tsx           ├── StarRating.tsx                  │
│  ├── Label.tsx            ├── LikeButton.tsx                  │
│  ├── SaleOffBadge.tsx     └── LanguageTag.tsx                │
│                                                                │
│  Import: import { Avatar, StarRating } from '@/components/atoms' │
└───────────────────────────────────────────────────────────────┘
                                ↓ uses
┌───────────────────────────────────────────────────────────────┐
│                    🎨 UI LAYER (Untitled UI)                  │
│  Design system base components - IMPORT DIRECTLY              │
│                                                                │
│  📁 src/components/ui/                                        │
│  ├── button.tsx           ├── input.tsx                       │
│  ├── checkbox.tsx         ├── table.tsx (planned)            │
│  ├── select.tsx (planned) └── modal.tsx (planned)            │
│                                                                │
│  Import: import { Button, Input } from '@/components/ui'     │
│  ⚠️ NEVER re-export these through atoms!                      │
└───────────────────────────────────────────────────────────────┘
                                ↓ uses
┌───────────────────────────────────────────────────────────────┐
│                    🔷 FOUNDATIONS LAYER                        │
│  Design tokens, icons, and base utilities                     │
│                                                                │
│  📁 src/components/foundations/                               │
│  ├── dot-icon.tsx         ├── colors.ts (planned)            │
│  ├── typography.ts (...)  └── spacing.ts (planned)           │
│                                                                │
│  Import: import { DotIcon } from '@/components/foundations'  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Flow Example

Here's how a complete page uses all layers:

```
┌─────────────────────────────────────────┐
│         ProfilePage.tsx                  │
│         (Your page component)            │
└─────────────────────────────────────────┘
         │
         ├─→ Header (organism)
         │    │
         │    ├─→ Button (ui)
         │    └─→ Avatar (atom)
         │         └─→ DotIcon (foundation)
         │
         ├─→ UserCard (molecule)
         │    │
         │    ├─→ Avatar (atom)
         │    ├─→ StarRating (atom)
         │    └─→ Button (ui)
         │
         ├─→ FormItem (molecule)
         │    │
         │    ├─→ Label (atom)
         │    ├─→ Input (ui)
         │    └─→ Button (ui)
         │
         └─→ Footer (organism)
              └─→ Button (ui)
```

---

## 📦 Import Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│  Level 5: APPLICATION LAYER (Pages, Layouts)             │
│  Can import: Everything below                            │
├──────────────────────────────────────────────────────────┤
│  Level 4: ORGANISMS                                      │
│  Can import: Molecules, Atoms, UI, Foundations           │
├──────────────────────────────────────────────────────────┤
│  Level 3: MOLECULES                                      │
│  Can import: Atoms, UI, Foundations                      │
├──────────────────────────────────────────────────────────┤
│  Level 2: ATOMS (Custom)                                 │
│  Can import: UI, Foundations                             │
├──────────────────────────────────────────────────────────┤
│  Level 1: UI (Untitled UI)                              │
│  Can import: Foundations only                            │
├──────────────────────────────────────────────────────────┤
│  Level 0: FOUNDATIONS                                    │
│  Can import: Nothing (base layer)                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Tree: Where Should My Component Go?

```
                    Creating a new component?
                              │
                    ┌─────────┴─────────┐
                    │                   │
          Is it from Untitled UI?    No, it's custom
                    │                   │
                   Yes                  │
                    ↓                   ↓
            Put in ui/          Is it a complete feature/section
            (button, input,     with business logic?
             table, modal)              │
                              ┌─────────┴─────────┐
                             Yes                 No
                              ↓                   ↓
                      Put in organisms/    Does it combine 2+
                      (Header, Footer,     other components?
                       Features)                  │
                                      ┌───────────┴───────────┐
                                     Yes                     No
                                      ↓                       ↓
                              Put in molecules/       Put in atoms/
                              (UserCard, FormItem,    (Avatar, Badge,
                               SearchBar)              StarRating)
```

---

## ✅ Import Rules Summary

| What you need           | Import from                | Example                                              |
| ----------------------- | -------------------------- | ---------------------------------------------------- |
| Button, Input, Checkbox | `@/components/ui`          | `import { Button } from '@/components/ui'`           |
| Avatar, StarRating      | `@/components/atoms`       | `import { Avatar } from '@/components/atoms'`        |
| UserCard, FormItem      | `@/components/molecules`   | `import { UserCard } from '@/components/molecules'`  |
| Header, Footer          | `@/components/organisms`   | `import { Header } from '@/components/organisms'`    |
| DotIcon, design tokens  | `@/components/foundations` | `import { DotIcon } from '@/components/foundations'` |

---

## 🚫 Common Mistakes to Avoid

```
❌ DON'T: Import UI from atoms
import { Button } from '@/components/atoms';

✅ DO: Import UI directly
import { Button } from '@/components/ui';

---

❌ DON'T: Re-export UI in atoms/index.ts
export { Button } from '@/components/ui';

✅ DO: Keep atoms/index.ts for custom atoms only
export { Avatar } from './Avatar';

---

❌ DON'T: Import from nested paths
import Button from '@/components/ui/button';

✅ DO: Use barrel exports
import { Button } from '@/components/ui';

---

❌ DON'T: Create circular dependencies
// molecule imports organism that imports the molecule

✅ DO: Follow one-way imports (up the hierarchy)
```

---

## 📊 Component Count by Layer

Current state of your project:

| Layer           | Count | Examples                               |
| --------------- | ----- | -------------------------------------- |
| **Organisms**   | ~25   | Header, Footer, Features, Testimonials |
| **Molecules**   | ~23   | UserCard, FormItem, GallerySlider      |
| **Atoms**       | ~14   | Avatar, StarRating, Label, Badge       |
| **UI**          | 3     | Button, Input, Checkbox                |
| **Foundations** | 1     | DotIcon                                |

**Next steps:**

- Add more UI components (Table, Select, Modal, etc.)
- Add design tokens to Foundations (colors, typography)
- Audit existing components for proper layer placement

---

## 🎨 Real-World Example

```tsx
// src/app/(site)/profile/page.tsx

import { Button, Input, Checkbox } from "@/components/ui";
import { DotIcon } from "@/components/foundations";
import { Avatar, StarRating, Label } from "@/components/atoms";
import { UserCard, FormItem } from "@/components/molecules";
import { Header, Footer, Features } from "@/components/organisms";

export default function ProfilePage() {
	return (
		<div className='min-h-screen'>
			{/* Organism: Complex header with navigation */}
			<Header />

			<main className='container mx-auto py-8'>
				{/* Molecule: Composite card component */}
				<UserCard>
					{/* Atom: Simple avatar component */}
					<Avatar src='/user.jpg' alt='User' />

					<div>
						<h1 className='text-2xl font-bold'>John Doe</h1>

						{/* Atom: Custom rating component */}
						<StarRating rating={4.5} />
					</div>

					{/* UI: Base button from Untitled UI */}
					<Button variant='primary'>Edit Profile</Button>
				</UserCard>

				{/* Molecule: Form with label + input */}
				<FormItem label='Email' error=''>
					{/* UI: Base input from Untitled UI */}
					<Input type='email' placeholder='john@example.com' />
				</FormItem>

				<div className='flex items-center gap-2'>
					{/* UI: Base checkbox from Untitled UI */}
					<Checkbox />

					{/* Atom: Custom label */}
					<Label>Subscribe to newsletter</Label>

					{/* Foundation: Icon */}
					<DotIcon />
				</div>

				{/* Organism: Complex features section */}
				<Features />
			</main>

			{/* Organism: Complex footer */}
			<Footer />
		</div>
	);
}
```

---

## 🎯 Key Takeaways

1. **ui/** = Untitled UI design system components (import directly!)
2. **atoms/** = Your custom small components (not UI re-exports)
3. **molecules/** = Combinations of atoms + UI
4. **organisms/** = Large features with business logic
5. **foundations/** = Icons, tokens, base utilities

**Golden Rule:** Always import UI components from `@/components/ui`, never through atoms!
