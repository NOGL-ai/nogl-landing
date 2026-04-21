Migrate @heroicons/react icon imports to @untitledui/icons in the specified file(s).

## Mapping

```json
{
  "CheckCircleIcon": "CheckCircle",
  "CheckBadgeIcon": "CheckVerified01",
  "ExclamationTriangleIcon": "AlertTriangle",
  "InformationCircleIcon": "InfoCircle",
  "XCircleIcon": "XCircle",
  "XMarkIcon": "XClose",
  "ChevronDownIcon": "ChevronDown",
  "ChevronUpIcon": "ChevronUp",
  "ChevronLeftIcon": "ChevronLeft",
  "ChevronRightIcon": "ChevronRight",
  "ArrowRightIcon": "ArrowRight",
  "ArrowUpIcon": "ArrowUp",
  "ArrowDownIcon": "ArrowDown",
  "BellIcon": "Bell01",
  "GlobeAltIcon": "Globe01",
  "StarIcon": "Star01",
  "EyeIcon": "Eye",
  "MinusIcon": "Minus",
  "PlusIcon": "Plus",
  "MoonIcon": "Moon01",
  "SunIcon": "Sun",
  "DocumentTextIcon": "FileText01",
  "Bars3Icon": "Menu01",
  "MagnifyingGlassIcon": "SearchLg",
  "HomeIcon": "Home01",
  "UserIcon": "User01",
  "UsersIcon": "Users01",
  "Cog6ToothIcon": "Settings01",
  "CogIcon": "Settings01",
  "EnvelopeIcon": "Mail01",
  "LockClosedIcon": "Lock01",
  "ArrowLeftOnRectangleIcon": "LogOut01",
  "ArrowRightOnRectangleIcon": "LogIn01"
}
```

Heroicons import paths that may appear:
- `@heroicons/react/24/outline`
- `@heroicons/react/24/solid`
- `@heroicons/react/16/solid`
- `@heroicons/react/20/solid`

## Steps

1. Read the target file(s).
2. Find all `import { ... } from '@heroicons/react/...'` statements.
3. For each imported name, look up the UUI equivalent above.
4. Replace the import with `import { UuiName } from '@untitledui/icons'`, aliasing if needed.
5. Update JSX usages to use the new name.
6. Run `npx tsc --noEmit` to verify.

## Rules

- Heroicons use `Icon` suffix by convention; UUI does not — always alias at import to avoid JSX churn: `import { CheckCircle as CheckCircleIcon } from '@untitledui/icons'`.
- All three heroicon size variants (`24/outline`, `24/solid`, `16/solid`) map to the same UUI icon; size is controlled by className `h-4 w-4` etc., not the import path.
- Verify icon exists before committing: `node -e "const i = require('@untitledui/icons'); console.log(!!i.IconName);"`.
