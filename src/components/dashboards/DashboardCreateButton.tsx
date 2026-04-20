import { Plus as PlusIcon } from '@untitledui/icons';
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDashboard } from "@/actions/dashboards";
import { Button } from '@/components/base/buttons/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Locale } from "@/i18n";

type Persona = "CFO" | "CMO" | "OPS" | "GENERIC";

export function DashboardCreateButton({ lang }: { lang: Locale }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [persona, setPersona] = useState<Persona>("GENERIC");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const { id } = await createDashboard(name.trim(), persona);
      setOpen(false);
      setName("");
      router.push(`/${lang}/analytics/dashboards/${id}`);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
        <PlusIcon className="h-4 w-4" />
        New Dashboard
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Dashboard</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dash-name">Name</Label>
              <Input
                id="dash-name"
                placeholder="e.g. Competitor Overview (4w)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dash-persona">Persona</Label>
              <Select
                value={persona}
                onValueChange={(v) => setPersona(v as Persona)}
              >
                <SelectTrigger id="dash-persona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERIC">Generic</SelectItem>
                  <SelectItem value="CFO">CFO — Finance</SelectItem>
                  <SelectItem value="CMO">CMO — Marketing</SelectItem>
                  <SelectItem value="OPS">Ops — Pricing &amp; Merch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
