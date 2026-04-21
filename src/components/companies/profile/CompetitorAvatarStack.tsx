import { Button } from '@/components/base/buttons/button';
import type { CompanyCompetitorPreviewDTO } from "@/types/company";

type CompetitorAvatarStackProps = {
  competitors: CompanyCompetitorPreviewDTO[];
  compareLabel: string;
};

export function CompetitorAvatarStack({ competitors, compareLabel }: CompetitorAvatarStackProps) {
  if (competitors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex -space-x-2">
        {competitors.slice(0, 8).map((c) => (
          <div
            key={c.id}
            title={c.name}
            className="relative inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white bg-bg-tertiary text-center text-xs font-semibold leading-9 text-text-tertiary"
          >
            {c.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- competitor logos are external dynamic URLs
              <img src={c.logoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="w-full">{c.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        ))}
      </div>
      <Button type="button" color="secondary" size="sm" className="rounded-full">
        {compareLabel}
      </Button>
    </div>
  );
}
