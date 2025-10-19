"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={{
				months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
				month: "space-y-4",
				caption: "flex justify-center pt-1 relative items-center",
				caption_label: "text-sm font-medium",
				nav: "space-x-1 flex items-center",
			nav_button: cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-primary_hover hover:text-primary",
				"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
			),
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				table: "w-full border-collapse space-y-1",
				head_row: "flex",
			head_cell:
				"text-tertiary rounded-md w-9 font-normal text-[0.8rem]",
				row: "flex w-full mt-2",
				cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-secondary_bg/50 [&:has([aria-selected])]:bg-secondary_bg first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
			day: cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary_hover hover:text-primary",
				"h-9 w-9 p-0 font-normal aria-selected:opacity-100"
			),
				day_range_end: "day-range-end",
			day_selected:
				"bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
			day_today: "bg-secondary_bg text-primary",
			day_outside:
				"day-outside text-tertiary opacity-50 aria-selected:bg-secondary_bg/50 aria-selected:text-tertiary aria-selected:opacity-30",
			day_disabled: "text-tertiary opacity-50",
			day_range_middle:
				"aria-selected:bg-secondary_bg aria-selected:text-primary",
				day_hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ ...props }) => {
					if (props.orientation === 'left') {
						return <ChevronLeft className="h-4 w-4" />
					}
					return <ChevronRight className="h-4 w-4" />
				},
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
