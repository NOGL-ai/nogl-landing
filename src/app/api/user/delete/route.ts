import { prisma } from "@/lib/prismaDb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function DELETE(request: Request) {
	const body = await request.json();
	const { email } = body;

	if (!email) {
		return new NextResponse("Missing Fields", { status: 400 });
	}

	const session = await getAuthSession();
	const formatedEmail = email.toLowerCase();

	const user = await prisma.user.findUnique({
		where: {
			email: formatedEmail,
		},
	});

	const isOthorized = session?.user?.email === email || user?.role === "ADMIN";

	if (!isOthorized) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const isDemoUser = user?.email?.includes("demo-");

	if (isDemoUser) {
		return new NextResponse("Can't delete demo user", { status: 401 });
	}

	try {
		await prisma.user.delete({
			where: {
				email: formatedEmail,
			},
		});

		return new NextResponse("Account Deleted Successfully!", { status: 200 });
	} catch {
		return new NextResponse("Something went wrong", { status: 500 });
	}
}
