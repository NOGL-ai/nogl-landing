"use client";

import React, { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/base/buttons/button";
import RepricingRulesCard from "../molecules/RepricingRulesCard";
import { activateRule, pauseRule, reorderRules } from "@/actions/repricing/rules";
import { simulateRule } from "@/actions/repricing/execution";
import type { RepricingRuleDTO } from "@/lib/repricing/types";

interface Props {
  initialRules: RepricingRuleDTO[];
}

// ─── Sortable wrapper ─────────────────────────────────────────────────────────

function SortableCard({
  rule,
  onToggle,
  onManage,
  onRunPreview,
}: {
  rule: RepricingRuleDTO;
  onToggle: (id: string, active: boolean) => void;
  onManage: (id: string) => void;
  onRunPreview: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle — separate from card click targets */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-grab touch-none text-text-tertiary hover:text-text-secondary focus:outline-none"
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="pl-7">
        <RepricingRulesCard
          rule={rule}
          onToggle={onToggle}
          onManage={onManage}
          onRunPreview={onRunPreview}
        />
      </div>
    </div>
  );
}

// ─── Main organism ────────────────────────────────────────────────────────────

export default function RepricingRules({ initialRules }: Props) {
  const router = useRouter();
  const [rules, setRules] = useState<RepricingRuleDTO[]>(initialRules);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── Toggle active/paused ───────────────────────────────────────────────

  const handleToggle = useCallback(
    (id: string, active: boolean) => {
      // Optimistic update
      setRules((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: active ? "ACTIVE" : "PAUSED" } : r
        )
      );
      startTransition(async () => {
        try {
          if (active) {
            await activateRule(id);
          } else {
            await pauseRule(id);
          }
        } catch (err) {
          // Revert on error
          setRules((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, status: active ? "PAUSED" : "ACTIVE" } : r
            )
          );
          toast.error(err instanceof Error ? err.message : "Failed to update rule");
        }
      });
    },
    []
  );

  // ─── Navigate to wizard ─────────────────────────────────────────────────

  const handleManage = useCallback((id: string) => {
    router.push(`/repricing/manage?id=${id}`);
  }, [router]);

  // ─── Run preview ────────────────────────────────────────────────────────

  const handleRunPreview = useCallback((id: string) => {
    startTransition(async () => {
      try {
        toast.loading("Running preview…", { id: `preview-${id}` });
        const job = await simulateRule(id);
        toast.success("Preview ready!", { id: `preview-${id}` });
        router.push(`/repricing/auto-overview?jobId=${job.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Preview failed", {
          id: `preview-${id}`,
        });
      }
    });
  }, [router]);

  // ─── Drag to reorder ────────────────────────────────────────────────────

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = rules.findIndex((r) => r.id === active.id);
      const newIndex = rules.findIndex((r) => r.id === over.id);
      const reordered = arrayMove(rules, oldIndex, newIndex);

      // Optimistic update
      setRules(reordered);

      // Persist
      startTransition(async () => {
        try {
          await reorderRules(reordered.map((r) => r.id));
        } catch {
          toast.error("Failed to save order");
          setRules(rules); // revert
        }
      });
    },
    [rules]
  );

  return (
    <div className="min-h-screen w-full bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border-primary bg-background px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Repricing Rules</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              Create and manage your automated pricing rules
            </p>
          </div>
          <Button
            color="primary"
            size="sm"
            onClick={() => router.push("/repricing/manage")}
            className="flex items-center gap-1.5 bg-brand-solid hover:bg-brand-solid_hover"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>

        {/* Empty state */}
        {rules.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-primary bg-background py-16 text-center">
            <p className="text-base font-medium text-text-primary">No repricing rules yet</p>
            <p className="mt-1 text-sm text-text-secondary">
              Create your first rule to start automating your pricing.
            </p>
            <Button
              color="primary"
              size="sm"
              onClick={() => router.push("/repricing/manage")}
              className="mt-4 bg-brand-solid hover:bg-brand-solid_hover"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        )}

        {/* Rules grid with DnD */}
        {rules.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rules.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rules.map((rule) => (
                  <SortableCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggle}
                    onManage={handleManage}
                    onRunPreview={handleRunPreview}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
