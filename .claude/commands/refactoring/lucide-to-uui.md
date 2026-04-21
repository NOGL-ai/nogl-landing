Migrate lucide-react icon imports to @untitledui/icons in the specified file(s).

## Mapping

```json
{
  "ChevronDown": "ChevronDown",
  "ChevronUp": "ChevronUp",
  "ChevronLeft": "ChevronLeft",
  "ChevronRight": "ChevronRight",
  "ChevronsUpDown": "ChevronSelectorVertical",
  "ChevronDownIcon": "ChevronDown",
  "X": "XClose",
  "XIcon": "XClose",
  "Plus": "Plus",
  "PlusIcon": "Plus",
  "Minus": "Minus",
  "MinusIcon": "Minus",
  "Check": "Check",
  "CheckIcon": "Check",
  "CheckCircle2": "CheckCircle",
  "XCircle": "XCircle",
  "AlertCircle": "AlertCircle",
  "AlertCircleIcon": "AlertCircle",
  "AlertTriangle": "AlertTriangle",
  "AlertTriangleIcon": "AlertTriangle",
  "Info": "InfoCircle",
  "Search": "SearchLg",
  "SearchMd": "SearchMd",
  "Download": "Download01",
  "Download01": "Download01",
  "DownloadCloudIcon": "DownloadCloud01",
  "FileDown": "Download01",
  "UploadCloud": "UploadCloud02",
  "ExternalLink": "LinkExternal01",
  "ExternalLinkIcon": "LinkExternal01",
  "Eye": "Eye",
  "EyeIcon": "Eye",
  "Edit": "Edit01",
  "EditIcon": "Edit01",
  "Trash2": "Trash01",
  "TrashIcon": "Trash01",
  "Pencil": "Edit01",
  "PencilIcon": "Edit01",
  "Calendar": "Calendar",
  "CalendarIcon": "Calendar",
  "CalendarDays": "CalendarDate",
  "CalendarRange": "Calendar",
  "Clock": "Clock",
  "ClockIcon": "Clock",
  "Bell": "Bell01",
  "Lock": "Lock01",
  "Globe": "Globe01",
  "Mail": "Mail01",
  "MailIcon": "Mail01",
  "Settings": "Settings01",
  "Settings2": "Settings02",
  "Share2": "Share04",
  "ArrowLeft": "ArrowLeft",
  "ArrowRight": "ArrowRight",
  "ArrowUp": "ArrowUp",
  "ArrowDown": "ArrowDown",
  "ArrowUpDown": "SwitchVertical01",
  "ArrowUpIcon": "ArrowUp",
  "ArrowDownIcon": "ArrowDown",
  "TrendingUp": "TrendUp01",
  "TrendingUpIcon": "TrendUp01",
  "TrendingDown": "TrendDown01",
  "TrendingDownIcon": "TrendDown01",
  "DollarSign": "CurrencyDollar",
  "Sparkles": "Stars02",
  "Stars02": "Stars02",
  "Filter": "FilterLines",
  "FilterIcon": "FilterLines",
  "SlidersHorizontal": "SlidersTwo02",
  "MoreHorizontal": "DotsHorizontal",
  "MoreVerticalIcon": "DotsVertical",
  "DotsVertical": "DotsVertical",
  "GripVertical": "DotsGrid",
  "GripVerticalIcon": "DotsGrid",
  "LayoutGrid": "Grid01",
  "LayoutList": "Rows01",
  "List": "List",
  "Columns2": "Columns02",
  "LayoutDashboardIcon": "LayoutAlt01",
  "Package": "Package",
  "Package2": "Package",
  "Boxes": "Package",
  "Tag": "Tag01",
  "Tag01": "Tag01",
  "Play": "Play",
  "Pause": "Pause",
  "RotateCcw": "RefreshCcw02",
  "RefreshCcw": "RefreshCcw02",
  "Loader2": "LoadingCircle01",
  "LoaderCircleIcon": "LoadingCircle01",
  "Copy": "Copy01",
  "CopyIcon": "Copy01",
  "FileText": "FileText01",
  "Facebook": "FacebookSolid",
  "Instagram": "Instagram",
  "Archive": "Archive",
  "Database": "Database01",
  "Palette": "Palette",
  "FlaskConical": "Beaker01",
  "PieChart": "PieChart01",
  "StarIcon": "Star01",
  "UploadCloud02": "UploadCloud02",
  "Menu02": "Menu01",
  "Menu01": "Menu01",
  "CheckSquare": "CheckSquare",
  "XSquare": "XSquare",
  "Music2": "MusicNote01",
  "Video": "VideoRecorder",
  "ImageIcon": "Image01",
  "Table2": "Table"
}
```

Icons with no UUI equivalent — keep in lucide-react with `// eslint-disable-next-line no-restricted-imports` comment:
- `FilterX`, `Cookie`, `GripVertical` (use `DotsGrid` instead — see above)

## Steps

1. Read the target file(s) identified in the argument.
2. Find all `import { ... } from 'lucide-react'` statements.
3. For each imported name:
   - Look up the UUI equivalent in the mapping above.
   - If found: add to the `@untitledui/icons` import, remove from lucide.
   - If not found: leave in lucide with an eslint-disable comment noting no equivalent.
4. Update all JSX usages — the component name changes if the mapping key ≠ value (e.g. `<CalendarRange>` → `<Calendar>`).
5. Remove the lucide import line if it becomes empty.
6. Merge with any existing `@untitledui/icons` import on the same line using aliasing where needed (`Calendar as CalendarIcon` etc.).
7. Run `npx tsc --noEmit` and fix any resulting type errors.

## Rules

- Never use `replace_all` for `text-primary` or `bg-primary` — these are substrings of already-migrated UUI tokens and will cause triple-prefix cascade errors.
- Prefer aliasing over renaming usages: `import { Calendar as CalendarRange }` lets JSX stay unchanged.
- Check that the UUI icon actually exists with: `node -e "const i = require('@untitledui/icons'); console.log(!!i.IconName);"` before committing.
- `Facebook` and `Instagram` are in the mapping but NOT yet in the installed package version — fall back to inline SVG if the node check returns false.
