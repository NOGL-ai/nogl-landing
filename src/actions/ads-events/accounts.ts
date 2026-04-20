"use server";

import { prisma } from "@/lib/prismaDb";
import { revalidatePath } from "next/cache";

export async function mapAdAccount(accountId: string, name: string) {
  if (!accountId || !name) return;

  // Try to match a competitor by name first, then company
  const [competitor, company] = await Promise.all([
    prisma.competitor.findFirst({ where: { name: { contains: name, mode: "insensitive" } } }),
    prisma.company.findFirst({ where: { name: { contains: name, mode: "insensitive" } } }),
  ]);

  await prisma.$executeRawUnsafe(
    `UPDATE ads_events."AdAccount"
     SET status = 'ACTIVE',
         "competitorId" = $1,
         "companyId" = $2,
         updated_at = NOW()
     WHERE id = $3`,
    competitor?.id ?? null,
    company?.id ?? null,
    accountId,
  );

  revalidatePath("/en/marketing-assets/accounts");
}
