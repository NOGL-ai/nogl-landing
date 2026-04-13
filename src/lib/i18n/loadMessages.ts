import type { AbstractIntlMessages } from "next-intl";

export type AppLocale = "en" | "de";

export function resolveLocale(lang: string | undefined): AppLocale {
  return lang === "de" ? "de" : "en";
}

export async function loadMessages(lang: string | undefined): Promise<{
  locale: AppLocale;
  messages: AbstractIntlMessages;
}> {
  const locale = resolveLocale(lang);
  const messages =
    locale === "de"
      ? ((await import("@/messages/de.json")).default as AbstractIntlMessages)
      : ((await import("@/messages/en.json")).default as AbstractIntlMessages);
  return { locale, messages };
}
