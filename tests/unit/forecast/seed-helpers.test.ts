import {
  discountFactor,
  idrToEur,
  mapInstaxCategoryToNogl,
  mapInstaxMethodToChannel,
  parseInstaxDate,
  seasonalFactor,
  slugify,
  weekdayFactor,
} from "@/lib/forecast/seed-helpers";

describe("forecast/seed-helpers", () => {
  describe("mapInstaxCategoryToNogl", () => {
    it("maps known Indonesian categories", () => {
      expect(mapInstaxCategoryToNogl("Kamera")).toBe("cameras");
      expect(mapInstaxCategoryToNogl("Film")).toBe("accessories");
      expect(mapInstaxCategoryToNogl("Aksesoris")).toBe("accessories");
      expect(mapInstaxCategoryToNogl("Lensa")).toBe("lenses");
      expect(mapInstaxCategoryToNogl("Tripod")).toBe("tripods");
    });

    it("defaults unknown categories to accessories", () => {
      expect(mapInstaxCategoryToNogl("Unknown")).toBe("accessories");
      expect(mapInstaxCategoryToNogl("")).toBe("accessories");
    });
  });

  describe("mapInstaxMethodToChannel", () => {
    it("maps marketplace methods", () => {
      expect(mapInstaxMethodToChannel("Tokopedia")).toBe("marketplace");
      expect(mapInstaxMethodToChannel("Shopee")).toBe("marketplace");
    });

    it("maps web methods", () => {
      expect(mapInstaxMethodToChannel("Online Store")).toBe("web");
      expect(mapInstaxMethodToChannel("Website")).toBe("web");
    });

    it("maps wholesale to b2b", () => {
      expect(mapInstaxMethodToChannel("Wholesale")).toBe("b2b");
    });

    it("falls back to web for unknown", () => {
      expect(mapInstaxMethodToChannel("something")).toBe("web");
      expect(mapInstaxMethodToChannel("")).toBe("web");
    });
  });

  describe("seasonalFactor", () => {
    it("peaks in Nov/Dec", () => {
      expect(seasonalFactor(new Date("2025-12-15"))).toBeGreaterThan(1.4);
      expect(seasonalFactor(new Date("2025-11-05"))).toBeGreaterThan(1.4);
    });

    it("lifts modestly in Jul/Aug", () => {
      expect(seasonalFactor(new Date("2025-07-15"))).toBeCloseTo(1.1);
      expect(seasonalFactor(new Date("2025-08-15"))).toBeCloseTo(1.1);
    });

    it("is neutral in other months", () => {
      expect(seasonalFactor(new Date("2025-03-15"))).toBe(1.0);
    });
  });

  describe("weekdayFactor", () => {
    it("dampens b2b on weekends", () => {
      // 2025-03-15 is Saturday
      expect(weekdayFactor("b2b", new Date("2025-03-15"))).toBeLessThan(0.5);
    });

    it("leaves web and marketplace unchanged", () => {
      expect(weekdayFactor("web", new Date("2025-03-15"))).toBe(1.0);
      expect(weekdayFactor("marketplace", new Date("2025-03-15"))).toBe(1.0);
    });

    it("is neutral for b2b on weekdays", () => {
      // 2025-03-17 is Monday
      expect(weekdayFactor("b2b", new Date("2025-03-17"))).toBe(1.0);
    });
  });

  describe("discountFactor", () => {
    it("returns channel-specific factors", () => {
      expect(discountFactor("web")).toBe(1.0);
      expect(discountFactor("marketplace")).toBe(0.92);
      expect(discountFactor("b2b")).toBe(0.85);
    });
  });

  describe("slugify", () => {
    it("lowercases and hyphenates", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("strips diacritics", () => {
      expect(slugify("Café Latté")).toBe("cafe-latte");
    });

    it("trims leading and trailing hyphens", () => {
      expect(slugify("  !!! hi !!!  ")).toBe("hi");
    });
  });

  describe("parseInstaxDate", () => {
    it("parses ISO dates", () => {
      const d = parseInstaxDate("2025-03-15");
      expect(d).toBeInstanceOf(Date);
      expect(d!.getUTCFullYear()).toBe(2025);
      expect(d!.getUTCMonth()).toBe(2);
      expect(d!.getUTCDate()).toBe(15);
    });

    it("parses DMY format", () => {
      const d = parseInstaxDate("15/03/2025");
      expect(d!.getUTCFullYear()).toBe(2025);
      expect(d!.getUTCMonth()).toBe(2);
      expect(d!.getUTCDate()).toBe(15);
    });

    it("returns null for unparseable input", () => {
      expect(parseInstaxDate("")).toBeNull();
      expect(parseInstaxDate("not a date")).toBeNull();
    });
  });

  describe("idrToEur", () => {
    it("applies the fixed rate and rounds to cents", () => {
      expect(idrToEur(1_000_000, 0.000058)).toBeCloseTo(58.0, 2);
    });

    it("handles non-finite input", () => {
      expect(idrToEur(NaN, 0.000058)).toBe(0);
    });
  });
});
