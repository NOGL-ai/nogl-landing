import { SessionType } from "@prisma/client";

export interface CategoryConfig {
  name: string;
  shortName: string;
  type: SessionType | undefined;
}

export const CATEGORY_CONFIG: readonly CategoryConfig[] = [
  { name: "All", shortName: "All", type: undefined },
  { name: "1:1 Call", shortName: "1:1", type: SessionType.ONE_ON_ONE },
  { name: "Group Calls", shortName: "Group", type: SessionType.GROUP },
  { name: "Webinars", shortName: "Webinars", type: SessionType.WEBINAR },
  { name: "Bundles", shortName: "Bundles", type: SessionType.BUNDLE },
  { name: "Digital Mastery", shortName: "Digital", type: SessionType.DIGITAL_PRODUCT }
] as const;