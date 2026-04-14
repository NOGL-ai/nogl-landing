"use server";
import { prisma } from "@/lib/prismaDb";
import { isAuthorized } from "@/lib/isAuthorized";
import { UserRole } from "@prisma/client";

type UserUpdateInput = {
	email: string;
	[key: string]: unknown;
};

type UserDeleteInput = {
	email: string;
};

export async function getUsers(filter?: UserRole) {
	const currentUser = await isAuthorized();

	const res = await prisma.user.findMany({
		where: {
			role: filter,
		},
	});

	const filtredUsers = res.filter(
		(user: { email?: string | null }) =>
			user.email !== currentUser?.email && !user.email?.includes("demo-")
	);

	return filtredUsers;
}

export async function updateUser(data: UserUpdateInput) {
	const { email } = data;
	return await prisma.user.update({
		where: {
			email: email.toLowerCase(),
		},
		data: {
			...data,
			email: email.toLowerCase(),
		},
	});
}

export async function deleteUser(user: UserDeleteInput | null | undefined) {
	if (user?.email?.includes("demo-")) {
		return new Error("Can't delete demo user");
	}

	if (!user) {
		return new Error("User not found");
	}

	return await prisma.user.delete({
		where: {
			email: user?.email.toLowerCase() as string,
		},
	});
}

export async function serchUser(email: string) {
	return await prisma.user.findUnique({
		where: {
			email: email.toLowerCase(),
		},
	});
}
