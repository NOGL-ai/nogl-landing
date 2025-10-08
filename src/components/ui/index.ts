// Untitled UI Components - Barrel Exports
// Re-export all components from their nested locations

// Buttons
export { Button } from "./button";

// Inputs
export { Input } from "./input";

// Checkbox
export { default as Checkbox } from "./checkbox";
export { default as CheckboxComponent } from "./checkbox";

// Tables
export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
} from "./table";

// Select
export { Select as SelectSimple } from "./select";
// Removed select-new from barrel export to prevent SSR issues with createContext
// export {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "./select-new";

// Modal (removed: use application/modals instead)

// Card
export {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
	CardTitle,
	CardDescription,
} from "./card";

// Badge
export { Badge } from "./badge";

// Toggle
export { default as Toggle } from "./toggle";

// Dropdown Menu
export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "./dropdown-menu";

// Removed popover from barrel export to prevent SSR issues with createContext
// export { Popover, PopoverTrigger, PopoverContent } from "./popover";

// Alert
export { Alert } from "./alert";

// Particles (visual effects)
export { default as Particles } from "./particles";

// Additional UI components
export { Slider } from "./slider";
export { AnimatedSubscribeButton } from "./animated-subscribe-button";
export { default as ShimmerButton } from "./shimmer-button";

// Add more Untitled UI components as you create them
// export { Dropdown } from './dropdown';
// export { Tooltip } from './tooltip';
