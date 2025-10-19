# Competitor Track Modal - Usage Guide

## Overview

The `CompetitorTrackModal` is a fully responsive, theme-aware modal component built following UntitledUI design system best practices. It provides a comprehensive form for tracking competitor information.

## Features

- ✅ Pixel-perfect implementation from Figma design
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Accessible with ARIA attributes
- ✅ Form validation
- ✅ Loading states
- ✅ Decorative background pattern
- ✅ Modular and scalable architecture

## Installation

The component is already available in your project at:
```typescript
import { CompetitorTrackModal } from "@/components/application/modals/competitor-track-modal";
// Or use the index export:
import { CompetitorTrackModal } from "@/components/application/modals";
```

## Basic Usage

```tsx
"use client";

import { useState } from "react";
import { CompetitorTrackModal } from "@/components/application/modals";
import type { CompetitorFormData } from "@/components/application/modals";

export default function CompetitorPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSubmit = async (data: CompetitorFormData) => {
		console.log("Submitting competitor:", data);
		// Add your API call here
		// await fetch('/api/competitors', { method: 'POST', body: JSON.stringify(data) });
	};

	const handleSaveDraft = async (data: CompetitorFormData) => {
		console.log("Saving draft:", data);
		// Add your draft save logic here
	};

	return (
		<div>
			<button onClick={() => setIsModalOpen(true)}>
				Track New Competitor
			</button>

			<CompetitorTrackModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleSubmit}
				onSaveDraft={handleSaveDraft}
			/>
		</div>
	);
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls the modal visibility |
| `onClose` | `() => void` | Yes | Called when the modal should close |
| `onSubmit` | `(data: CompetitorFormData) => void \| Promise<void>` | No | Called when "Add Competitor" is clicked |
| `onSaveDraft` | `(data: CompetitorFormData) => void \| Promise<void>` | No | Called when "Save as draft" is clicked |

## CompetitorFormData Interface

```typescript
interface CompetitorFormData {
	name: string;
	library?: string;
	website: string;
	location?: string;
	channel: string;
	title: string;
	description: string;
}
```

## Advanced Usage with API Integration

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CompetitorTrackModal } from "@/components/application/modals";
import type { CompetitorFormData } from "@/components/application/modals";

export default function CompetitorsPage() {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSubmit = async (data: CompetitorFormData) => {
		try {
			const response = await fetch("/api/competitors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) throw new Error("Failed to create competitor");

			const competitor = await response.json();
			
			toast.success("Competitor added successfully!");
			router.push(`/en/competitors/${competitor.id}`);
		} catch (error) {
			console.error("Error creating competitor:", error);
			toast.error("Failed to add competitor");
			throw error; // Re-throw to keep modal open
		}
	};

	const handleSaveDraft = async (data: CompetitorFormData) => {
		try {
			const response = await fetch("/api/competitors/drafts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) throw new Error("Failed to save draft");

			toast.success("Draft saved successfully!");
		} catch (error) {
			console.error("Error saving draft:", error);
			toast.error("Failed to save draft");
			throw error;
		}
	};

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Competitors</h1>
				<button
					onClick={() => setIsModalOpen(true)}
					className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
				>
					Track Competitor
				</button>
			</div>

			{/* Your competitors list */}

			<CompetitorTrackModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleSubmit}
				onSaveDraft={handleSaveDraft}
			/>
		</div>
	);
}
```

## Styling Customization

The modal uses Tailwind CSS and follows the UntitledUI design system. All colors are theme-aware and will automatically adapt to dark mode.

### Key Design Features

1. **Decorative Background Pattern**: Concentric circles in the top-left corner
2. **Featured Icon**: Gray modern style icon with flag
3. **Responsive Layout**: Stacks fields vertically on mobile, side-by-side on desktop
4. **Form Validation**: Submit button disabled until required fields are filled
5. **Loading States**: Button shows spinner during submission

## Accessibility

The modal includes:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly tooltips
- Semantic HTML structure

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- Flexbox
- CSS Custom Properties
- ES6+

## Notes

- The modal uses a fixed backdrop that can be clicked to close
- Form data is controlled internally but can be pre-populated if needed
- All base components (Input, Select, TextArea, Button) follow UntitledUI design patterns
- The component is fully tree-shakeable and optimized for production builds
