# ✅ Quick Checklist - Repository Cleanup

## 🎯 High Priority (Start Here)

### Phase 1: Component Structure (Week 1)

- [ ] **1. Create new folder structure** (2 hours)
  - Create: `components/ui/`, `primitives/`, `patterns/`, `layouts/`, `features/`
  - Document the structure
- [ ] **2. Consolidate CardCategory components** (3 hours)
  - Merge CardCategory1-6 into single CategoryCard with variants
  - Create CategoryCard.tsx with variant prop
  - Update all usages
- [ ] **3. Consolidate CardAuthorBox components** (2 hours)
  - Merge CardAuthorBox + CardAuthorBox2
  - Create unified UserCard component
  - Update imports
- [ ] **4. Fix naming conventions** (4 hours)
  - Rename BtnLikeIcon → LikeButton
  - Rename FiveStartIconForRate → StarRating (fix typo!)
  - Rename NcInputNumber → NumberInput
  - Rename uitls.ts → utils.ts
  - Rename contants.ts → constants.ts

### Phase 2: Design System (Week 2)

- [ ] **5. Set up design tokens** (4 hours)
  - Create `design-system/tokens/` folder
  - Extract colors, spacing, typography
  - Create token files
- [ ] **6. Implement Untitled UI properly** (6 hours)
  - Configure theme
  - Set up component variants
  - Migrate components to use tokens
- [ ] **7. Clean up dependencies** (2 hours)
  - Run `npm audit`
  - Remove unused packages
  - Test build

### Phase 3: Code Quality (Week 3)

- [ ] **8. Remove all commented code** (2 hours)
  - Search for `//` and `/* */` commented blocks
  - Delete or uncomment
- [ ] **9. Fix TypeScript types** (4 hours)
  - Replace all `any` types
  - Add proper interfaces
  - Add JSDoc comments
- [ ] **10. Create barrel exports** (3 hours)
  - Add index.ts to major folders
  - Export components properly

---

## 🔥 Quick Wins (Do These First!)

### Already Completed ✅

- ✅ Removed unused table components
- ✅ Removed unused documentation
- ✅ Consolidated sidebars
- ✅ Removed console.log statements

### Can Do Right Now (30 min each)

- [ ] Fix typo: `FiveStartIconForRate` → `FiveStarIconForRate`
- [ ] Fix typo: `uitls.ts` → `utils.ts`
- [ ] Fix typo: `contants.ts` → `constants.ts`
- [ ] Rename folder: `contains/` → `constants/`
- [ ] Delete `components/examples/` folder (unused)

---

## 📊 Progress Tracking

**Completion Status:**

- Phase 1: ⬜⬜⬜⬜⬜ 0/5
- Phase 2: ⬜⬜⬜⬜⬜ 0/5
- Phase 3: ⬜⬜⬜⬜⬜ 0/5

**Total Progress:** 0/15 (0%)

---

## 🚨 Important Commands

```bash
# Before starting
git checkout -b cleanup/best-practices
git commit -m "checkpoint: starting cleanup"

# After each task
npm run build
npm run lint
git add .
git commit -m "cleanup: [describe change]"

# Testing
npm run dev
npm run test (if tests exist)

# Final check
npm run build
npm run lint
```

---

## 📝 Notes

- **Always test** after major changes
- **Commit frequently** (every 30-60 min)
- **Update imports** when moving files
- **Run linter** before committing
- **Document as you go**

---

**Start Date:** **\*\***\_\_\_**\*\***
**Target Completion:** 4 weeks
**Last Updated:** $(date)
