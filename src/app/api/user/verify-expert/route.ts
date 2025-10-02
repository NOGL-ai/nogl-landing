import { prisma } from "@/lib/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expertise, experience, linkedinProfile, portfolio } = body;

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
        expertise,
        experience,
        socialLinks: {
          linkedin: linkedinProfile,
          portfolio
        }
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