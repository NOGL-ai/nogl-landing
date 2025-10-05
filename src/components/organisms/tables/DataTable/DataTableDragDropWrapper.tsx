"use client";

import React from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Table } from "@tanstack/react-table";

interface DataTableDragDropWrapperProps<TData> {
	table: Table<TData>;
	enableColumnReordering?: boolean;
	children: React.ReactNode;
}

export function DataTableDragDropWrapper<TData>({
	table,
	enableColumnReordering = false,
	children,
}: DataTableDragDropWrapperProps<TData>) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = table.getAllColumns().findIndex((column) => column.id === active.id);
			const newIndex = table.getAllColumns().findIndex((column) => column.id === over?.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				const newColumnOrder = arrayMove(
					table.getAllColumns().map((col) => col.id),
					oldIndex,
					newIndex
				);
				table.setColumnOrder(newColumnOrder);
			}
		}
	};

	if (!enableColumnReordering) {
		return <>{children}</>;
	}

	const columnIds = table.getAllColumns().map((column) => column.id);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={columnIds}
				strategy={horizontalListSortingStrategy}
			>
				{children}
			</SortableContext>
		</DndContext>
	);
}
