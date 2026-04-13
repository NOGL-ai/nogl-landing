type CountryPillProps = {
  country_code: string;
};

const FLAG_MAP: Record<string, string> = {
  DE: "🇩🇪",
  AT: "🇦🇹",
  CH: "🇨🇭",
  FR: "🇫🇷",
  GB: "🇬🇧",
  NL: "🇳🇱",
  PL: "🇵🇱",
  IT: "🇮🇹",
  ES: "🇪🇸",
  US: "🇺🇸",
};

export function CountryPill({ country_code }: CountryPillProps) {
  const normalizedCode = country_code?.toUpperCase() || "US";
  const flag = FLAG_MAP[normalizedCode] ?? "🌐";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <span aria-hidden="true">{flag}</span>
      <span>{normalizedCode}</span>
    </span>
  );
}
