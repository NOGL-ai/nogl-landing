# Chart Implementation Guide

## Table of Contents

- [Overview](#overview)
- [The Stacked Bar Chart Overflow Bug](#the-stacked-bar-chart-overflow-bug)
- [Root Cause Analysis](#root-cause-analysis)
- [Solution](#solution)
- [Utility Functions](#utility-functions)
- [Implementation Examples](#implementation-examples)
- [Testing Guidelines](#testing-guidelines)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)

## Overview

This guide documents the proper implementation of stacked bar charts to prevent the common overflow bug that occurs when calculating scaling values from individual segments instead of stacked totals.

**Last Updated:** 2025-01-19  
**Related Files:**
- `src/utils/chart-scaling.ts` - Utility functions
- `src/components/molecules/PricingBarChart.tsx` - Fixed implementation
- `src/components/molecules/BarChartCard.tsx` - Fixed implementation
- `tests/e2e/stacked-bar-charts.spec.ts` - E2E tests

## The Stacked Bar Chart Overflow Bug

### What is it?

A critical bug pattern where stacked bar charts overflow their containers by 2-3x their intended height, breaking layouts and user experience.

### Visual Impact

```
Expected:              What Happens (Bug):
┌─────────┐           ┌─────────┐
│         │           │    ┌────┤ ← Bar overflows!
│    █    │           │    │████│
│   ███   │           │    │████│
│  █████  │           │    │████│
└─────────┘           └────┴────┘
  Container              Container
```

### Real Example from Codebase

**Before Fix (Buggy):**
```
Chart Container: 182px height
Bar Heights:
- Jan: 316px (174% overflow!)
- Feb: 382px (210% overflow!)
- Nov: 382px (210% overflow!)
```

## Root Cause Analysis

### The Bug Pattern

```typescript
// ❌ WRONG - Causes overflow
const maxValue = Math.max(
  ...data.flatMap((d) => [d.comparable, d.competitive, d.premium])
);
// Result: 177 (just the largest individual segment)
```

### Why It Happens

1. **Stacked bars display cumulative totals**
   - Each bar draws from bottom upward
   - Height represents SUM of all segments

2. **Individual segments are smaller than totals**
   - Premium segment: 177
   - Competitive segment: 116  
   - Comparable segment: 57
   - **TOTAL: 350**

3. **Incorrect scaling calculation**
   ```
   Bar height = (350 / 177) × 193px = 382px
   Container height = 182px
   OVERFLOW = 200px (110% overflow!)
   ```

### Mathematical Explanation

Given data:
```typescript
const data = [
  { month: 'Jan', comparable: 48, competitive: 97, premium: 145 },  // Total: 290
  { month: 'Feb', comparable: 57, competitive: 116, premium: 177 }, // Total: 350 ← MAX
  { month: 'Mar', comparable: 39, competitive: 76, premium: 113 },  // Total: 228
];
```

**❌ Buggy Calculation:**
```typescript
maxValue = max([48, 97, 145, 57, 116, 177, 39, 76, 113]) = 177

Feb bar height = (57 + 116 + 177) / 177 × 100% = 197.74%
   // 197% of container = OVERFLOW!
```

**✅ Correct Calculation:**
```typescript
maxValue = max([290, 350, 228]) = 350

Feb bar height = (57 + 116 + 177) / 350 × 100% = 100%
   // Exactly fills container ✓
```

## Solution

### Core Fix

Replace individual segment max with stacked total max:

```typescript
// ✅ CORRECT - No overflow
const maxValue = Math.max(
  ...data.map((d) => d.comparable + d.competitive + d.premium)
);
// Result: 350 (max of all TOTALS)
```

### Using Utility Functions (Recommended)

```typescript
import { calculateStackedMaxValue, calculateBarHeight } from '@/utils/chart-scaling';

// Calculate safe max value
const maxValue = calculateStackedMaxValue(
  data,
  ['comparable', 'competitive', 'premium'],
  { strategy: 'dynamic', padding: 1 }
);

// Calculate individual bar heights
<div
  style={{
    height: `${calculateBarHeight(cumulativeValue, maxValue)}%`
  }}
/>
```

## Utility Functions

### `calculateStackedMaxValue()`

Calculates the maximum value for stacked charts by summing segments before finding max.

**Signature:**
```typescript
function calculateStackedMaxValue<T extends Record<string, unknown>>(
  data: T[],
  valueKeys: (keyof T)[],
  options?: ScalingOptions
): number
```

**Parameters:**
- `data`: Array of data points
- `valueKeys`: Keys representing values to stack
- `options`: Scaling configuration

**Options:**
```typescript
interface ScalingOptions {
  maxValue?: number;    // Fixed max (optional)
  padding?: number;     // Padding multiplier (default: 1)
  minScale?: number;    // Minimum scale (default: 0)
  strategy?: 'dynamic' | 'fixed' | 'hybrid';  // Default: 'dynamic'
}
```

**Strategies:**

1. **`dynamic`** (Recommended for most cases)
   - Adapts to data range automatically
   - No overflow possible
   - Scale changes with data

2. **`fixed`** (Use for consistent scales)
   - Uses predefined maxValue
   - Predictable across datasets
   - Requires domain knowledge

3. **`hybrid`** (Production recommended)
   - Combines dynamic and fixed
   - Takes max of (data max, fixed max)
   - Applies padding for breathing room

**Example:**
```typescript
// Dynamic scaling (adapts to data)
const maxValue = calculateStackedMaxValue(
  data,
  ['low', 'mid', 'high'],
  { strategy: 'dynamic', padding: 1 }
);

// Fixed scaling (consistent scale)
const maxValue = calculateStackedMaxValue(
  data,
  ['low', 'mid', 'high'],
  { strategy: 'fixed', maxValue: 500 }
);

// Hybrid (best of both)
const maxValue = calculateStackedMaxValue(
  data,
  ['low', 'mid', 'high'],
  { strategy: 'hybrid', maxValue: 400, padding: 1.1 }
);
```

### `calculateBarHeight()`

Calculates safe height percentage, capped at 100%.

**Signature:**
```typescript
function calculateBarHeight(
  value: number,
  maxValue: number
): number
```

**Returns:** Percentage (0-100) safe for CSS

**Example:**
```typescript
// For cumulative height: 250, maxValue: 350
const height = calculateBarHeight(250, 350);
// Returns: 71.43

// Edge case: value equals max
const height = calculateBarHeight(350, 350);
// Returns: 100 (capped, safe)

// Edge case: value exceeds max
const height = calculateBarHeight(400, 350);
// Returns: 100 (capped, prevents overflow!)
```

## Implementation Examples

### Example 1: Basic Stacked Bar Chart

```typescript
import { calculateStackedMaxValue, calculateBarHeight } from '@/utils/chart-scaling';

interface ChartData {
  month: string;
  value1: number;
  value2: number;
  value3: number;
}

export default function StackedChart({ data }: { data: ChartData[] }) {
  // Calculate max from stacked totals
  const maxValue = calculateStackedMaxValue(
    data as unknown as Record<string, unknown>[],
    ['value1', 'value2', 'value3'],
    { strategy: 'dynamic' }
  );

  return (
    <div className="chart-container">
      {data.map((item, i) => (
        <div key={i} className="bar-group">
          {/* Base segment */}
          <div style={{
            height: `${calculateBarHeight(item.value3, maxValue)}%`
          }} />
          
          {/* Middle segment (cumulative) */}
          <div style={{
            height: `${calculateBarHeight(item.value2 + item.value3, maxValue)}%`
          }} />
          
          {/* Top segment (total) */}
          <div style={{
            height: `${calculateBarHeight(
              item.value1 + item.value2 + item.value3,
              maxValue
            )}%`
          }} />
        </div>
      ))}
    </div>
  );
}
```

### Example 2: With Theme Awareness

```typescript
export default function ThemedStackedChart({ data }: Props) {
  const maxValue = calculateStackedMaxValue(
    data as unknown as Record<string, unknown>[],
    ['comparable', 'competitive', 'premium'],
    { strategy: 'dynamic', padding: 1.05 } // 5% padding
  );

  return (
    <div className="relative" style={{ height: '193px' }}>
      {data.map((item, index) => (
        <div key={index} className="bar-container">
          {/* Premium (bottom) */}
          <div
            className="absolute bottom-0 w-full rounded-t-md"
            style={{
              height: `${calculateBarHeight(item.premium, maxValue)}%`,
              backgroundColor: 'var(--color-brand-700)', // Theme-aware!
            }}
          />
          
          {/* Competitive (middle) */}
          <div
            className="absolute bottom-0 w-full rounded-t-md"
            style={{
              height: `${calculateBarHeight(
                item.premium + item.competitive,
                maxValue
              )}%`,
              backgroundColor: 'var(--color-brand-500)',
            }}
          />
          
          {/* Comparable (top) */}
          <div
            className="absolute bottom-0 w-full rounded-t-md"
            style={{
              height: `${calculateBarHeight(
                item.premium + item.competitive + item.comparable,
                maxValue
              )}%`,
              backgroundColor: 'var(--color-brand-200)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

### Example 3: With Fixed Scale

```typescript
// When you need consistent scale across different pages
export default function ComparisonChart({ data }: Props) {
  // Always scales to 1000, regardless of actual data
  const maxValue = calculateStackedMaxValue(
    data as unknown as Record<string, unknown>[],
    ['sales', 'revenue', 'profit'],
    { 
      strategy: 'fixed',
      maxValue: 1000 // Business-defined maximum
    }
  );

  // ... rest of implementation
}
```

## Testing Guidelines

### Manual Testing Checklist

- [ ] Visual inspection: No bars exceed container
- [ ] Theme toggle: Works in both light and dark mode
- [ ] Tab switching: Scale adjusts correctly
- [ ] Data extremes: Test with very large/small values
- [ ] Edge cases: Empty data, zero values, negative values

### Automated Testing

```typescript
// E2E test example
test('should not overflow container', async ({ page }) => {
  const container = await page.locator('.chart-container').boundingBox();
  const bars = await page.locator('.bar').all();
  
  for (const bar of bars) {
    const barBox = await bar.boundingBox();
    expect(barBox.height).toBeLessThanOrEqual(container.height);
  }
});
```

### Visual Regression Testing

```typescript
// Playwright visual regression
test('charts should match baseline', async ({ page }) => {
  await page.goto('/dashboard');
  const charts = page.locator('.charts-section');
  await expect(charts).toHaveScreenshot('charts-baseline.png', {
    maxDiffPixels: 100
  });
});
```

## Best Practices

### 1. Always Use Stacked Totals

✅ **DO:**
```typescript
const maxValue = Math.max(
  ...data.map(d => d.segment1 + d.segment2 + d.segment3)
);
```

❌ **DON'T:**
```typescript
const maxValue = Math.max(
  ...data.flatMap(d => [d.segment1, d.segment2, d.segment3])
);
```

### 2. Use Utility Functions

✅ **DO:**
```typescript
import { calculateStackedMaxValue } from '@/utils/chart-scaling';

const maxValue = calculateStackedMaxValue(data, ['a', 'b', 'c']);
```

❌ **DON'T:**
```typescript
// Reinventing the wheel
const maxValue = Math.max(...data.map(d => d.a + d.b + d.c));
```

### 3. Add Padding for Visual Breathing Room

✅ **DO:**
```typescript
const maxValue = calculateStackedMaxValue(data, keys, {
  strategy: 'dynamic',
  padding: 1.1 // 10% padding above tallest bar
});
```

### 4. Cap Heights at 100%

✅ **DO:**
```typescript
const height = Math.min((value / maxValue) * 100, 100);
```

This prevents floating-point errors from causing micro-overflows.

### 5. Use Theme-Aware Colors

✅ **DO:**
```typescript
backgroundColor: 'var(--color-brand-500)' // Theme-aware
```

❌ **DON'T:**
```typescript
backgroundColor: '#9E77ED' // Hardcoded, breaks dark mode
```

## Common Pitfalls

### Pitfall 1: Forgetting Cumulative Heights

❌ **WRONG:**
```typescript
{/* Each segment uses its own value */}
<div style={{ height: `${segment1 / max * 100}%` }} />
<div style={{ height: `${segment2 / max * 100}%` }} />
<div style={{ height: `${segment3 / max * 100}%` }} />
```

✅ **CORRECT:**
```typescript
{/* Each segment uses cumulative value */}
<div style={{ height: `${segment1 / max * 100}%` }} />
<div style={{ height: `${(segment1 + segment2) / max * 100}%` }} />
<div style={{ height: `${(segment1 + segment2 + segment3) / max * 100}%` }} />
```

### Pitfall 2: Not Handling Edge Cases

❌ **WRONG:**
```typescript
const height = (value / maxValue) * 100;
// Breaks when maxValue is 0!
```

✅ **CORRECT:**
```typescript
const height = maxValue === 0 ? 0 : Math.min((value / maxValue) * 100, 100);
```

### Pitfall 3: Theme-Unaware Colors

❌ **WRONG:**
```typescript
<div className="bg-[#9E77ED]" />
// Hardcoded color, doesn't change with theme
```

✅ **CORRECT:**
```typescript
<div style={{ backgroundColor: 'var(--color-brand-500)' }} />
// Uses CSS variable that adapts to theme
```

### Pitfall 4: No TypeScript Safety

❌ **WRONG:**
```typescript
const maxValue = calculateStackedMaxValue(data, ['typo', 'wrong', 'keys']);
// No type checking!
```

✅ **CORRECT:**
```typescript
// Utility function is generic, provides type safety
const maxValue = calculateStackedMaxValue(
  data as unknown as Record<string, unknown>[],
  ['comparable', 'competitive', 'premium'] as const
);
```

## Industry Standards

Our approach aligns with industry-standard data visualization libraries:

### D3.js
```javascript
const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.total)])  // Max of TOTALS
  .range([0, height]);
```

### Chart.js
```javascript
scales: {
  y: {
    stacked: true,
    max: Math.max(...data.map(d => d.values.reduce((a, b) => a + b)))
  }
}
```

### Recharts (React)
```typescript
// Automatically calculates max from stacked totals
<StackedBarChart data={data}>
  <Bar dataKey="value1" stackId="a" />
  <Bar dataKey="value2" stackId="a" />
  <Bar dataKey="value3" stackId="a" />
</StackedBarChart>
```

## Migration Guide

### Migrating Existing Charts

1. **Identify buggy charts:**
   ```bash
   # Search for the bug pattern
   grep -r "flatMap.*\[d\." src/components/molecules/
   ```

2. **Import utilities:**
   ```typescript
   import { calculateStackedMaxValue, calculateBarHeight } from '@/utils/chart-scaling';
   ```

3. **Replace maxValue calculation:**
   ```diff
   - const maxValue = Math.max(...data.flatMap(d => [d.a, d.b, d.c]));
   + const maxValue = calculateStackedMaxValue(
   +   data as unknown as Record<string, unknown>[],
   +   ['a', 'b', 'c'],
   +   { strategy: 'dynamic' }
   + );
   ```

4. **Update bar heights:**
   ```diff
   - height: `${(value / maxValue) * 100}%`
   + height: `${calculateBarHeight(value, maxValue)}%`
   ```

5. **Test thoroughly:**
   - Visual inspection
   - Theme toggle
   - E2E tests

## Related Documentation

- [Design Tokens Migration Guide](./DESIGN_TOKENS_MIGRATION_GUIDE.md)
- [Untitled UI Token Reference](./UNTITLED_UI_TOKEN_REFERENCE.md)
- [Component Structure Guide](../architecture/COMPONENT_STRUCTURE.md)

## Support

If you encounter issues or have questions:

1. Check this guide first
2. Review fixed implementations:
   - `src/components/molecules/PricingBarChart.tsx`
   - `src/components/molecules/BarChartCard.tsx`
3. Run E2E tests: `npm run test:e2e tests/e2e/stacked-bar-charts.spec.ts`
4. Consult the team

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-19  
**Maintainer:** Development Team

