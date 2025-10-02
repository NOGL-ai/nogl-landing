"use server";

import { prisma } from "@/lib/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createApiKey(name: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Generate a random API key
  const apiKey = `nogl_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  try {
    const newApiKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        userId: session.user.id,
      },
    });

    return newApiKey;
  } catch (error) {
    console.error("Error creating API key:", error);
    throw new Error("Failed to create API key");
  }
}

export async function getApiKeys() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiKeys;
  } catch (error) {
    console.error("Error fetching API keys:", error);
    throw new Error("Failed to fetch API keys");
  }
}

export async function deleteApiKey(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.apiKey.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting API key:", error);
    throw new Error("Failed to delete API key");
  }
}
