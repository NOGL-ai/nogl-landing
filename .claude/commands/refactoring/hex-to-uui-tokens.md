Replace hardcoded hex color classes (bg-[#hex], text-[#hex], border-[#hex], hover:bg-[#hex], ring-[#hex]) with UUI Tailwind token classes.

## Mapping

Hex (lowercase, no #) → UUI token class by usage context:

| Hex | bg | text | border | ring |
|-----|----|------|--------|------|
| `0a0d12` | `bg-primary` | `text-primary` | `border-primary` | `ring-primary` |
| `fafafa` | `bg-secondary` | `text-secondary` | `border-secondary` | `ring-secondary` |
| `ffffff` | `bg-primary` | `text-white` | `border-primary` | `ring-white` |
| `252b37` | `bg-secondary_hover` | `text-tertiary` | `border-secondary` | `ring-secondary` |
| `181d27` | `bg-primary_hover` | `text-primary_on-brand` | `border-primary` | `ring-primary` |
| `414651` | `bg-quaternary` | `text-secondary` | `border-tertiary` | `ring-tertiary` |
| `535862` | `bg-tertiary` | `text-tertiary` | `border-tertiary` | `ring-tertiary` |
| `717680` | `bg-tertiary` | `text-quaternary` | `border-tertiary` | `ring-tertiary` |
| `a4a7ae` | `bg-quaternary` | `text-tertiary_hover` | `border-tertiary` | `ring-tertiary` |
| `d5d7da` | `bg-quaternary` | `text-secondary_hover` | `border-secondary` | `ring-secondary` |
| `e9eaeb` | `bg-secondary` | `text-disabled` | `border-secondary` | `ring-secondary` |
| `182230` | `bg-primary_hover` | `text-primary` | `border-primary` | `ring-primary` |
| `17b26a` | `bg-success-solid` | `text-success-primary` | `border-success` | `ring-success` |
| `6941c6` | `bg-brand-solid` | `text-brand-secondary` | `border-brand` | `ring-brand` |
| `7f56d9` | `bg-brand-solid` | `text-brand-secondary` | `border-brand` | `ring-brand` |
| `375dfb` | `bg-brand-solid` | `text-brand-secondary` | `border-brand` | `ring-brand` |
| `f5f5f5` | `bg-secondary_hover` | `text-tertiary` | `border-secondary` | `ring-secondary` |
| `1f2533` | `bg-primary_hover` | `text-tertiary` | `border-tertiary` | `ring-tertiary` |
| `1a1f2d` | `bg-primary_hover` | `text-tertiary` | `border-tertiary` | `ring-tertiary` |

## Steps

1. Grep the target file(s) for `\[#[0-9a-fA-F]{3,6}\]` to find all hex color usages.
2. For each match, determine the prefix (`bg-`, `text-`, `border-`, `ring-`, `hover:bg-`, `dark:bg-`, etc.).
3. Look up the hex (lowercased, no `#`) in the mapping above and select the column matching the prefix.
4. Replace `bg-[#0a0d12]` → `bg-primary`, `text-[#717680]` → `text-quaternary`, etc.
5. For `hover:bg-[#hex]` patterns, apply the `bg` column value: `hover:bg-[#252b37]` → `hover:bg-secondary_hover`.
6. For `dark:` variants, treat them the same way — just prepend `dark:` to the resolved token.
7. Verify with grep that no `[#` patterns remain in the modified files.

## Rules

- These token names follow the UUI CSS layer naming (`bg-primary` = `bg-[--color-bg-primary]` etc.) — do NOT confuse with shadcn `bg-primary` (brand fill). Context matters: nav chrome hex values map to neutral bg/text tokens, not brand tokens.
- Hex values not in the table: do not guess — flag them for manual review with a `// TODO: hex #xxxx not in mapping` comment.
- The automated script lives at `migration/scripts/04-nav-hex-to-tokens.mjs`; run it with `node migration/scripts/04-nav-hex-to-tokens.mjs <glob>` for bulk conversion.
