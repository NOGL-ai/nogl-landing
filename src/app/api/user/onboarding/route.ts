// Constants
const DEFAULT_USER_ROLE = "USER";
const R2_BUCKET_URL =
	"https://13e9f73c8bdfbd5ad59f51c1dd20f5eb.r2.cloudflarestorage.com/nogl";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaDb";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();

		const imageKey = formData.get("image")?.toString();
		const imageUrl = imageKey
			? `${R2_BUCKET_URL}/${imageKey}`
			: session.user.image;

		const updateData: Prisma.UserUpdateInput = {
			role: DEFAULT_USER_ROLE,
			isCommunityMember: formData.get("isCommunityMember") === "true",
			name: formData.get("displayName")?.toString(),
			onboardingCompleted: true,
			image: imageUrl,
		};

		const user = await prisma.user.update({
			where: { email: session.user.email },
			data: updateData,
		});

		return NextResponse.json({
			email: user.email,
			name: user.name,
			image: user.image,
		});
	} catch (error) {
		console.error("[ONBOARDING_ERROR]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
