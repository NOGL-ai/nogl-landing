## Modal Variants Guide (react-aria based)

This guide documents the shared modal system built on `react-aria-components` and how to use multiple consistent looks via a `variant` prop.

### Components

- `ModalOverlay`: backdrop, focus trap, accessibility wiring
- `Modal`: modal container (size, radius, background)
- `Dialog`: your content wrapper

Import:

```tsx
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
```

### Variants

Available values for `variant`: `plain | glass | brand | sheet | fullscreen`

- plain: white surface, rounded, shadow
- glass: translucent, blur, subtle ring
- brand: gradient brand surface, white text
- sheet: mobile bottom-sheet, card on desktop
- fullscreen: takes the whole screen

Both `ModalOverlay` and `Modal` accept `variant`. If omitted, `plain` is used.

### Basic usage

```tsx
<ModalOverlay isOpen={open} onOpenChange={setOpen}>
  <Modal>
    <Dialog className="p-6">
      {/* content */}
    </Dialog>
  </Modal>
  {/* overlay closes on outside click by default via react-aria */}
</ModalOverlay>
```

### With variant

```tsx
<ModalOverlay isOpen={open} onOpenChange={setOpen} variant="glass">
  <Modal variant="glass" className="sm:max-w-2xl">
    <Dialog className="p-8">
      {/* content */}
    </Dialog>
  </Modal>
</ModalOverlay>
```

### Bottom sheet (Untitled UI friendly)

```tsx
<ModalOverlay isOpen={open} onOpenChange={setOpen} variant="sheet">
  <Modal variant="sheet" className="sm:max-w-xl">
    <Dialog className="p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">Title</h2>
        <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100" onClick={() => setOpen(false)}>Close</button>
      </div>
      <div className="py-6">{/* body */}</div>
      <div className="flex justify-end gap-2 border-t pt-4">
        <button className="rounded-lg bg-gray-100 px-3.5 py-2.5 hover:bg-gray-200" onClick={() => setOpen(false)}>Cancel</button>
        <button className="rounded-lg bg-gray-900 px-3.5 py-2.5 text-white hover:bg-gray-800">Confirm</button>
      </div>
    </Dialog>
  </Modal>
</ModalOverlay>
```

### Styling notes (Untitled UI)

- Radii: `sm:rounded-xl` (12px), `sm:rounded-2xl` (16px)
- Spacing: `p-6`, `p-8` for content-heavy dialogs
- Surfaces: `bg-white` with `shadow-xl` / `shadow-2xl`
- Borders: `border` or `ring-1 ring-gray-200/60`
- Overlay: `bg-black/50` (plain), lighter + blur for glass

You can further customize per-instance via `className` (string or function). Animations are preserved (`fade-in/out`, `zoom-in/out-95`).

### Creating reusable wrappers

Place shared wrappers in `src/components/application/modals/`, for example:

```tsx
// src/components/application/modals/GlassModal.tsx
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { cx } from "@/utils/cx";

export function GlassModal(props: React.ComponentProps<typeof ModalOverlay>) {
    return (
        <ModalOverlay {...props} variant="glass">
            <Modal variant="glass" className={(s) => cx("sm:max-w-2xl", typeof props.className === "function" ? props.className(s) : props.className)}>
                <Dialog className="p-8">{props.children}</Dialog>
            </Modal>
        </ModalOverlay>
    );
}
```

Use feature-specific wrappers colocated under the feature folder if the style is not globally reusable.

### Migration from deprecated UI modal

- Old file `src/components/ui/modal.tsx` was removed.
- Replace imports from `@/components/ui` with `@/components/application/modals/modal`.
- Use `<ModalOverlay><Modal><Dialog/></Modal></ModalOverlay>` with `variant` as needed.

### API reference

`ModalOverlay` props: `isOpen`, `onOpenChange`, `variant?`, `className?` (string | (state) => string)

`Modal` props: `variant?`, `className?` (string | (state) => string)

`Dialog` props: `className?`


