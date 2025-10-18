# Assistant UI Fix - Complete

## Issues Fixed

### Issue 1: Import Error
The application was failing to build with the following error:
```
Attempted import error: 'useAssistantState' is not exported from '@assistant-ui/react' (imported as 'useAssistantState').
```

### Issue 2: Console Warning
Console error about non-boolean attribute:
```
Received `true` for a non-boolean attribute `send`.
If you want to write it to the DOM, pass a string instead: send="true" or send={value.toString()}.
```

## Root Cause
The code in `src/components/attachment.tsx` was using `useAssistantState` hook, which was introduced in **@assistant-ui/react v0.12**. However, the project is currently using version **0.10.50**, which doesn't have this hook.

## Package Versions
- **Current Version**: `@assistant-ui/react@0.10.50`
- **Latest Version**: `@assistant-ui/react@0.11.28`
- **Hook introduced**: `useAssistantState` was added in v0.12

## Solution
Updated `src/components/attachment.tsx` to use the correct API for version 0.10.50:

### Changes Made:

1. **Replaced hooks**:
   - ❌ Removed: `useAssistantState` (not available in v0.10)
   - ❌ Removed: `useAssistantApi` (not needed)
   - ✅ Added: `useAttachment` (correct hook for v0.10)

2. **Updated `useAttachmentSrc` function**:
   ```typescript
   // Before: Used useAssistantState with selector
   const { file, src } = useAssistantState(
     useShallow(({ attachment }) => {...}),
   );
   
   // After: Use useAttachment directly
   const attachment = useAttachment();
   const fileSrc = useFileSrc(attachment.file);
   ```

3. **Updated `AttachmentThumb` component**:
   ```typescript
   // Before: Used useAssistantState
   const isImage = useAssistantState(
     ({ attachment }) => attachment.type === "image",
   );
   
   // After: Use useAttachment
   const attachment = useAttachment();
   const isImage = attachment.type === "image";
   ```

4. **Updated `AttachmentUI` component**:
   - Replaced `useAssistantState` calls with direct `useAttachment()`
   - Removed `useAssistantApi` dependency
   - Simplified conditional rendering logic

5. **Removed unused imports**:
   - Removed `useShallow` from `zustand/shallow`

## Files Modified
- `src/components/attachment.tsx` - Fixed `useAssistantState` import issue
- `src/components/thread.tsx` - Fixed `send` prop to `autoSend`

---

## Fix 2: ThreadPrimitive.Suggestion Prop

### The Problem
The `ThreadPrimitive.Suggestion` component was using `send` prop instead of the correct `autoSend` prop. This caused React to try passing a boolean attribute to the DOM element, resulting in a warning.

### The Solution
Changed the prop from `send` to `autoSend` in the ThreadSuggestions component:

```typescript
// Before (incorrect):
<ThreadPrimitive.Suggestion
  prompt={suggestedAction.action}
  send          // ❌ Wrong prop name
  asChild
>

// After (correct):
<ThreadPrimitive.Suggestion
  prompt={suggestedAction.action}
  autoSend      // ✅ Correct prop name
  asChild
>
```

### How I Found the Correct API
I checked the TypeScript definition file at:
```
node_modules/@assistant-ui/react/dist/primitives/thread/ThreadSuggestion.d.ts
```

Which shows the correct prop signature:
```typescript
{
    prompt: string;
    method?: "replace";
    autoSend?: boolean | undefined;  // ✅ This is the correct prop
}
```

---

## Upgrade Path (Optional)
If you want to use the latest features, you can upgrade to v0.12+:

```bash
npm install @assistant-ui/react@latest @assistant-ui/react-markdown@latest @assistant-ui/react-ui@latest
```

**Note**: v0.12+ has breaking changes. See migration guide: https://www.assistant-ui.com/docs/migrations/v0-12

## Testing Results
✅ No linter errors in `attachment.tsx`
✅ No linter errors in `thread.tsx`
✅ Files compile without errors
✅ React Hooks rules followed (no conditional hook calls)
✅ No console warnings about non-boolean attributes
✅ ThreadSuggestion component now uses correct `autoSend` prop

## References
- [Assistant UI Documentation](https://www.assistant-ui.com/)
- [Attachments Guide](https://www.assistant-ui.com/docs/advanced/Attachments)
- [v0.12 Migration Guide](https://www.assistant-ui.com/docs/migrations/v0-12)

