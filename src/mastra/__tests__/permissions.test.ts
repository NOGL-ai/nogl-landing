/**
 * Permission Tests
 * 
 * Tests for role-based permission checks in Mastra tools.
 */

import { 
  isAdmin, 
  canModifyCompetitor, 
  canModifyProducts, 
  canSendEmails,
  requireAdmin,
  requireCompetitorModification,
  requireProductModification,
  requireEmailSending
} from "../utils/prisma-context";

describe("Permission Checks", () => {
  describe("isAdmin", () => {
    test("should return true for ADMIN role", () => {
      expect(isAdmin("ADMIN")).toBe(true);
    });

    test("should return false for non-admin roles", () => {
      expect(isAdmin("EXPERT")).toBe(false);
      expect(isAdmin("USER")).toBe(false);
      expect(isAdmin("GUEST")).toBe(false);
    });
  });

  describe("canModifyCompetitor", () => {
    test("should allow ADMIN to modify any competitor", () => {
      expect(canModifyCompetitor("ADMIN")).toBe(true);
      expect(canModifyCompetitor("ADMIN", "any-id")).toBe(true);
    });

    test("should allow EXPERT to modify any competitor", () => {
      expect(canModifyCompetitor("EXPERT")).toBe(true);
      expect(canModifyCompetitor("EXPERT", "any-id")).toBe(true);
    });

    test("should deny USER from modifying competitors", () => {
      expect(canModifyCompetitor("USER")).toBe(false);
      expect(canModifyCompetitor("USER", "any-id")).toBe(false);
    });
  });

  describe("canModifyProducts", () => {
    test("should allow ADMIN and EXPERT to modify products", () => {
      expect(canModifyProducts("ADMIN")).toBe(true);
      expect(canModifyProducts("EXPERT")).toBe(true);
    });

    test("should deny USER from modifying products", () => {
      expect(canModifyProducts("USER")).toBe(false);
    });
  });

  describe("canSendEmails", () => {
    test("should allow ADMIN and EXPERT to send emails", () => {
      expect(canSendEmails("ADMIN")).toBe(true);
      expect(canSendEmails("EXPERT")).toBe(true);
    });

    test("should deny USER from sending emails", () => {
      expect(canSendEmails("USER")).toBe(false);
    });
  });

  describe("requireAdmin", () => {
    test("should not throw for ADMIN role", () => {
      expect(() => requireAdmin("ADMIN")).not.toThrow();
    });

    test("should throw for non-admin roles", () => {
      expect(() => requireAdmin("EXPERT")).toThrow("This operation requires admin privileges");
      expect(() => requireAdmin("USER")).toThrow("This operation requires admin privileges");
    });
  });

  describe("requireCompetitorModification", () => {
    test("should not throw for ADMIN role", () => {
      expect(() => requireCompetitorModification("ADMIN")).not.toThrow();
      expect(() => requireCompetitorModification("ADMIN", "any-id")).not.toThrow();
    });

    test("should not throw for EXPERT role", () => {
      expect(() => requireCompetitorModification("EXPERT")).not.toThrow();
      expect(() => requireCompetitorModification("EXPERT", "any-id")).not.toThrow();
    });

    test("should throw for USER role", () => {
      expect(() => requireCompetitorModification("USER")).toThrow("You don't have permission to modify competitor data");
      expect(() => requireCompetitorModification("USER", "any-id")).toThrow("You don't have permission to modify competitor data");
    });
  });

  describe("requireProductModification", () => {
    test("should not throw for ADMIN and EXPERT roles", () => {
      expect(() => requireProductModification("ADMIN")).not.toThrow();
      expect(() => requireProductModification("EXPERT")).not.toThrow();
    });

    test("should throw for USER role", () => {
      expect(() => requireProductModification("USER")).toThrow("You don't have permission to modify product data");
    });
  });

  describe("requireEmailSending", () => {
    test("should not throw for ADMIN and EXPERT roles", () => {
      expect(() => requireEmailSending("ADMIN")).not.toThrow();
      expect(() => requireEmailSending("EXPERT")).not.toThrow();
    });

    test("should throw for USER role", () => {
      expect(() => requireEmailSending("USER")).toThrow("You don't have permission to send emails");
    });
  });
});

