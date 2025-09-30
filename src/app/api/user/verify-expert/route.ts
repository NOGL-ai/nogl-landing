import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, username, bio, expertise, yearsOfExperience, languages, 
      expertCategories, hourlyRate, cancellationPolicy, companyType, 
      companyName, registrationNumber, businessAddress, vatId, taxId, 
      ustIdNr, steuernummer, payoutMethod, bankAccountHolder, iban, bic, 
      socialLinks, businessDocuments 
    } = body;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: {
        email: session.user.email as string,
      },
      data: {
        role: "EXPERT",
        name: name || session.user.name,
        username: username || session.user.username,
        bio: bio || session.user.bio,
        expertise: expertise || [],
        experience: yearsOfExperience || "",
        languages: languages || [],
        expertCategories: expertCategories || [],
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        cancellationPolicy: cancellationPolicy || "",
        companyType: companyType || "",
        companyName: companyName || "",
        registrationNumber: registrationNumber || "",
        businessAddress: businessAddress || {},
        vatId: vatId || "",
        taxId: taxId || "",
        ustIdNr: ustIdNr || "",
        steuernummer: steuernummer || "",
        payoutMethod: payoutMethod || "SEPA",
        bankAccountHolder: bankAccountHolder || "",
        iban: iban || "",
        bic: bic || "",
        socialLinks: socialLinks || {},
        businessDocuments: businessDocuments || {}
      },
    });

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error verifying expert:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
} 