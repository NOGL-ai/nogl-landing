import type { CompetitorRow } from "./types";

export const statusClasses: Record<CompetitorRow["status"], string> = {
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  INACTIVE: "border-gray-200 bg-gray-50 text-gray-700",
  MONITORING: "border-blue-200 bg-blue-50 text-blue-700",
  PAUSED: "border-yellow-200 bg-yellow-50 text-yellow-700",
  ARCHIVED: "border-gray-200 bg-gray-50 text-gray-700",
};
