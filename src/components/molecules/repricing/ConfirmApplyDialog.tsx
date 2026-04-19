"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/base/buttons/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  willApplyCount: number;
  totalImpact: number; // € sum of |delta|
}

export function ConfirmApplyDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  willApplyCount,
  totalImpact,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Apply price changes?</DialogTitle>
          <DialogDescription className="text-text-secondary">
            This will update prices for{" "}
            <strong className="text-text-primary">{willApplyCount} products</strong> with a
            combined impact of{" "}
            <strong className="text-text-primary">€{totalImpact.toFixed(2)}</strong>. This
            action can be rolled back from the History page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={onClose}
            isDisabled={isLoading}
            className="flex-1 border border-border-primary bg-background text-text-secondary"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-success-solid hover:bg-success-solid_hover"
          >
            Apply changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
