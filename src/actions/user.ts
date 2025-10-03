"use server";
import { prisma } from "@/lib/prismaDb";
import { isAuthorized } from "@/lib/isAuthorized";

export async function getUsers(filter: unknown) {
	const currentUser = await isAuthorized();

	const res = await prisma.user.findMany({
		where: {
			role: filter,
		},
	});

	const filtredUsers = res.filter(
		(user) =>
			user.email !== currentUser?.email && !user.email?.includes("demo-")
	);

	return filtredUsers;
}

export async function updateUser(data: unknown) {
	const { email } = data;
	return await prisma.user.update({
		where: {
			email: email.toLowerCase(),
		},
		data: {
			email: email.toLowerCase(),
			...data,
		},
	});
}

export async function deleteUser(user: unknown) {
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
