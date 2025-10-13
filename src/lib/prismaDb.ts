import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
const missingDatabaseMessage = 'DATABASE_URL environment variable is not set';

if (!databaseUrl) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(missingDatabaseMessage);
  }
  console.warn(`⚠️ ${missingDatabaseMessage}. Prisma client disabled; falling back to mock data.`);
}

if (databaseUrl && !directUrl) {
  console.warn('⚠️ DIRECT_URL not set - using DATABASE_URL');
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaUnavailableClient: PrismaClient | undefined;
}

const globalForPrisma = global as typeof global & {
  prisma?: PrismaClient;
  __prismaUnavailableClient?: PrismaClient;
};

const createUnavailableClient = (message: string): PrismaClient => {
  if (!globalForPrisma.__prismaUnavailableClient) {
    const handler: ProxyHandler<object> = {
      get: (_target, property) => {
        if (property === Symbol.toStringTag) {
          return 'PrismaClientUnavailable';
        }

        if (property === 'then') {
          return undefined;
        }

        return (..._args: unknown[]) => {
          throw new Error(`${message}. Attempted to access prisma.${String(property)} without a configured database.`);
        };
      },
    };

    globalForPrisma.__prismaUnavailableClient = new Proxy({}, handler) as PrismaClient;
  }

  return globalForPrisma.__prismaUnavailableClient;
};

const prismaClient =
  databaseUrl
    ? globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : createUnavailableClient(missingDatabaseMessage);

if (databaseUrl && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;
export const isPrismaAvailable = Boolean(databaseUrl);
