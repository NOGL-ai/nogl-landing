import "server-only";
import type { Locale } from "@/i18n";

const dictionaries = {
	en: () => import("@/dictionaries/en.json").then((module) => module.default),
	de: () => import("@/dictionaries/de.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
	const dictionary = dictionaries[locale];
	if (!dictionary) {
		throw new Error(`Dictionary for locale "${locale}" not found`);
	}
	return dictionary();
};
