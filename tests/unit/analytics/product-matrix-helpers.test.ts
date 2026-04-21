import {
  CAMERA_QUICK_FILTERS,
  categorySegmentCount,
  isMatrixDimension,
  normalizeCategorySegments,
  parseSlugList,
} from "@/lib/analytics/product-matrix-helpers";

describe("product-matrix-helpers", () => {
  it("isMatrixDimension accepts known keys", () => {
    expect(isMatrixDimension("company")).toBe(true);
    expect(isMatrixDimension("category")).toBe(true);
    expect(isMatrixDimension("nope")).toBe(false);
    expect(isMatrixDimension(null)).toBe(false);
  });

  it("normalizeCategorySegments splits on > | /", () => {
    expect(normalizeCategorySegments("A > B > C")).toEqual(["A", "B", "C"]);
    expect(normalizeCategorySegments("A | B")).toEqual(["A", "B"]);
    expect(normalizeCategorySegments("A / B / C")).toEqual(["A", "B", "C"]);
    expect(normalizeCategorySegments("   ")).toEqual([]);
  });

  it("categorySegmentCount matches segments", () => {
    expect(categorySegmentCount("a>b")).toBe(2);
    expect(categorySegmentCount("single")).toBe(1);
    expect(categorySegmentCount(null)).toBe(0);
  });

  it("parseSlugList caps and lowercases", () => {
    expect(parseSlugList("A,B,C", 2)).toEqual(["a", "b"]);
    expect(parseSlugList("all")).toEqual([]);
    expect(parseSlugList(null)).toEqual([]);
  });

  it("camera quick filters have stable ids", () => {
    const ids = CAMERA_QUICK_FILTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
