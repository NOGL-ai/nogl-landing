# Component Architecture Guide

> **A comprehensive guide to our hybrid component architecture combining Untitled UI Design System with Atomic Design principles**

## 🏗️ Architecture Overview

Our component structure follows a **5-layer hierarchy** that promotes reusability, maintainability, and clear separation of concerns. This hybrid approach combines the power of Untitled UI's design system with custom atomic components.

```
src/components/
│
├── 🎨 ui/                    # Untitled UI Design System
│   ├── button.tsx           # Base components from Untitled UI
│   ├── input.tsx            # Import directly - never re-export
│   ├── checkbox.tsx
│   └── index.ts             # Barrel exports
│
├── 🔷 foundations/           # Design System Foundations
│   ├── dot-icon.tsx         # Icons, design tokens, utilities
│   ├── colors.ts            # Color palette (planned)
│   └── index.ts             # Foundational exports
│
├── ⚛️ atoms/                 # Custom Atomic Components
│   ├── Avatar.tsx           # Your smallest building blocks
│   ├── StarRating.tsx       # Single-purpose components
│   └── index.ts             # Custom atoms only
│
├── 🧩 molecules/             # Composite Components
│   ├── UserCard.tsx         # Combinations of atoms + UI
│   ├── FormItem.tsx         # 2-5 component compositions
│   └── index.ts
│
└── 🏛️ organisms/             # Complex Components
    ├── Header/              # Full features with business logic
    ├── Footer.tsx           # Large, complex sections
    └── index.ts
```

---

## 📥 Import Patterns

### ✅ **Correct Import Pattern**

```tsx
// Untitled UI components - ALWAYS import directly
import { Button, Input, Checkbox } from "@/components/ui";

// Design foundations (icons, tokens, utilities)
import { DotIcon } from "@/components/foundations";

// Custom atomic components
import { Avatar, StarRating, Label } from "@/components/atoms";

// Composite components
import { UserCard, FormItem, SearchBar } from "@/components/molecules";

// Complex components with business logic
import { Header, Footer, Features } from "@/components/organisms";
```

### ❌ **Anti-Patterns to Avoid**

```tsx
// ❌ DON'T: Re-export UI components through atoms
import { Button } from "@/components/atoms";

// ❌ DON'T: Use nested paths when barrel exports exist
import Button from "@/components/ui/button";

// ❌ DON'T: Mix relative and absolute imports
import { Button } from "../components/ui";
```

---

## 🎯 Component Layer Guide

| Layer            | Purpose                   | Examples                      | Dependencies                         | When to Use                     |
| ---------------- | ------------------------- | ----------------------------- | ------------------------------------ | ------------------------------- |
| **ui/**          | Untitled UI design system | Button, Input, Table, Modal   | foundations only                     | Always for base UI elements     |
| **foundations/** | Design tokens & utilities | Icons, colors, spacing        | none                                 | For design system constants     |
| **atoms/**       | Custom smallest units     | Avatar, StarRating, Badge     | ui + foundations                     | Single-purpose components       |
| **molecules/**   | Component combinations    | UserCard, FormItem, SearchBar | atoms + ui + foundations             | 2-5 component compositions      |
| **organisms/**   | Complex features          | Header, Footer, Hero          | molecules + atoms + ui + foundations | Business logic & large sections |

---

## 🏛️ Architecture Principles

### 1. **Unidirectional Dependencies**

```
Organisms → Molecules → Atoms → UI → Foundations
    ↓         ↓         ↓      ↓        ↓
  Can use   Can use   Can use Can use  Base layer
  all below all below all below all below
```

### 2. **Clear Separation of Concerns**

- **UI Layer**: Pure Untitled UI components (no custom logic)
- **Foundations**: Design tokens and utilities (no dependencies)
- **Atoms**: Single-purpose custom components
- **Molecules**: Compositions without business logic
- **Organisms**: Complex features with business logic

### 3. **Import Rules**

1. **Always import UI components from `ui/`** - Never re-export
2. **Use barrel exports** - Import from `index.ts` files
3. **No circular dependencies** - Keep one-way imports
4. **Consistent naming** - PascalCase for components, kebab-case for files

---

## 🚀 Quick Start Guide

### Creating a New UI Component

```bash
# 1. Create the component file
touch src/components/ui/select.tsx

# 2. Add to barrel exports
echo "export { Select } from './select';" >> src/components/ui/index.ts
```

### Creating a Custom Atom

```bash
# 1. Create the component
touch src/components/atoms/NewAtom.tsx

# 2. Export from index
echo "export { default as NewAtom } from './NewAtom';" >> src/components/atoms/index.ts
```

### Using Components in Pages

```tsx
import { Button, Input } from "@/components/ui";
import { Avatar, StarRating } from "@/components/atoms";
import { UserCard } from "@/components/molecules";
import { Header, Footer } from "@/components/organisms";

export default function ProfilePage() {
	return (
		<>
			<Header />
			<main>
				<UserCard>
					<Avatar src='/user.jpg' />
					<StarRating rating={4.5} />
					<Button variant='primary'>Edit Profile</Button>
				</UserCard>
			</main>
			<Footer />
		</>
	);
}
```

---

## ⚡ Performance Considerations

### Barrel Exports: Pros & Cons

**✅ Pros:**

- Cleaner import statements
- Encapsulated module internals
- Easier refactoring
- Better developer experience

**⚠️ Cons:**

- Potential bundle size impact
- Tree-shaking challenges
- Circular dependency risks

**💡 Best Practices:**

- Use specific imports when possible: `import { Button } from '@/components/ui/button'`
- Monitor bundle size with tools like `webpack-bundle-analyzer`
- Avoid deep barrel export chains

### Bundle Optimization

```tsx
// ✅ Good: Specific imports for better tree-shaking
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ⚠️ Acceptable: Barrel imports (monitor bundle size)
import { Button, Input } from "@/components/ui";
```

---

## 🔧 Maintenance & Scalability

### Component Audit Checklist

- [ ] **Atoms**: Are they truly atomic? Single responsibility?
- [ ] **Molecules**: Do they combine 2-5 components? No business logic?
- [ ] **Organisms**: Do they contain business logic? Are they too complex?
- [ ] **UI Components**: Are they pure Untitled UI components?
- [ ] **Foundations**: Are they design tokens/utilities only?

### Scaling Guidelines

1. **Start Simple**: Begin with atoms, build up to organisms
2. **Composition Over Inheritance**: Favor component composition
3. **Single Responsibility**: Each component should do one thing well
4. **Consistent Patterns**: Follow established naming and structure conventions

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Re-exporting UI Components

```tsx
// ❌ DON'T: Re-export UI through atoms
// atoms/index.ts
export { Button } from "@/components/ui/button";

// ✅ DO: Import UI directly
import { Button } from "@/components/ui";
```

### Pitfall 2: Circular Dependencies

```tsx
// ❌ DON'T: Create circular imports
// molecule imports organism that imports the molecule

// ✅ DO: Follow unidirectional flow
// organisms → molecules → atoms → ui → foundations
```

### Pitfall 3: Mixing Concerns

```tsx
// ❌ DON'T: Put business logic in atoms
const Avatar = ({ user, onEdit }) => {
	const handleEdit = () => {
		// Business logic in atom
		userService.updateUser(user.id);
	};
};

// ✅ DO: Keep atoms pure
const Avatar = ({ src, alt, onClick }) => {
	return <img src={src} alt={alt} onClick={onClick} />;
};
```

---

## 📚 Documentation Structure

| File                        | Purpose                      | When to Use                           |
| --------------------------- | ---------------------------- | ------------------------------------- |
| **README.md**               | Quick reference & overview   | Start here for basic understanding    |
| **COMPONENT_STRUCTURE.md**  | Detailed architecture guide  | Deep dive into patterns & principles  |
| **IMPORT_EXAMPLES.tsx**     | Code examples & patterns     | Copy-paste examples for development   |
| **ARCHITECTURE_DIAGRAM.md** | Visual diagrams & flowcharts | Understanding component relationships |
| **QUICK_START.md**          | Getting started guide        | New team members or quick setup       |

---

## 🎯 Decision Tree

```
Creating a new component?
├── Is it from Untitled UI?
│   └── Yes → Put in ui/ (import directly)
└── No, it's custom
    ├── Is it a complete feature/section with business logic?
    │   └── Yes → Put in organisms/
    └── No
        ├── Does it combine 2+ other components?
        │   ├── Yes → Put in molecules/
        │   └── No → Put in atoms/
        └── Is it a design token/utility?
            └── Yes → Put in foundations/
```

---

## 🔗 Related Resources

- **[Untitled UI Design System](https://www.untitledui.com/)** - Official documentation
- **[Atomic Design Methodology](https://atomicdesign.bradfrost.com/)** - Brad Frost's methodology
- **[Component Driven Development](https://www.componentdriven.org/)** - CDD principles
- **[React Best Practices](https://react.dev/learn)** - Official React guidelines

---

## 🎉 Benefits of This Architecture

✅ **Clear Separation**: UI vs custom components are distinct  
✅ **Easy Imports**: Know exactly where to import from  
✅ **Scalable**: Easy to add components at any layer  
✅ **Maintainable**: Clear dependencies and responsibilities  
✅ **Type Safe**: Proper TypeScript support throughout  
✅ **Discoverable**: Barrel exports make components easy to find  
✅ **Performance**: Optimized for tree-shaking and bundle splitting  
✅ **Team Friendly**: Clear patterns for new developers

---

_This architecture balances the power of Untitled UI's design system with the flexibility of custom atomic components, creating a maintainable and scalable component library._
