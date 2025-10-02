// src/pages/api/user/update.ts

import { prisma } from "@/lib/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, image, bio, role, isCommunityMember, userType, referralSource, otherReferralSource, socialLinks, onboardingCompleted } = body;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.error("User not authenticated");
      return new NextResponse(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401 }
      );
    }

    const isDemo = session.user.email?.includes("demo-");

    if (isDemo) {
      console.warn("Attempt to update demo user");
      return new NextResponse(
        JSON.stringify({ error: "Can't update demo user" }),
        { status: 403 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      console.error("No data provided for update");
      return new NextResponse(
        JSON.stringify({ error: "No data provided" }),
        { status: 400 }
      );
    }

    const updateData: { [key: string]: any } = {};

    if (name !== undefined && name !== null) {
      updateData.name = name;
    }

    if (email !== undefined && email !== null) {
      updateData.email = email.toLowerCase();
    }

    if (image !== undefined && image !== null) {
      updateData.image = image.startsWith("http") ? image : `${image}`;
    }

    if (bio !== undefined && bio !== null) {
      updateData.bio = bio;
    }

    if (role !== undefined && role !== null) {
      updateData.role = role;
    }

    if (isCommunityMember !== undefined && isCommunityMember !== null) {
      updateData.isCommunityMember = isCommunityMember;
    }

    if (userType !== undefined) {
      updateData.userType = userType;
    }

    if (referralSource !== undefined) {
      updateData.referralSource = referralSource;
    }

    if (otherReferralSource !== undefined) {
      updateData.otherReferralSource = otherReferralSource;
    }

    if (socialLinks !== undefined) {
      updateData.socialLinks = socialLinks;
    }

    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted;
    }

    if (Object.keys(updateData).length === 0) {
      console.error("No valid fields provided for update");
      return new NextResponse(
        JSON.stringify({ error: "No valid fields provided for update" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        email: session.user.email as string,
      },
      data: {
        ...updateData,
      },
    });

    revalidatePath("/user");

    return NextResponse.json(
      {
        email: user.email,
        name: user.name,
        image: user.image,
        bio: user.bio,
        role: user.role,
        isCommunityMember: user.isCommunityMember,
        userType: user.userType,
        referralSource: user.referralSource,
        otherReferralSource: user.otherReferralSource,
        socialLinks: user.socialLinks,
        onboardingCompleted: user.onboardingCompleted
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}
