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
    // Build a recursive proxy so chained calls like prisma.notification.count()
    // also throw a clear error instead of "not a function".
    const makeProxy = (path: string): object => {
      const handler: ProxyHandler<object> = {
        get: (_target, property) => {
          if (property === Symbol.toStringTag) {
            return 'PrismaClientUnavailable';
          }
          if (property === 'then') {
            // Prevent accidental "thenable" detection
            return undefined;
          }
          return makeProxy(path ? `${path}.${String(property)}` : String(property));
        },
        // Trap direct calls: prisma.someMethod() or prisma.model.count()
        apply: (_target, _thisArg, _args) => {
          throw new Error(
            `${message}. Attempted to call prisma.${path}() without a configured database.`,
          );
        },
      };
      // Use a function as target so the proxy itself is callable
      return new Proxy(function () {} as unknown as object, handler);
    };

    globalForPrisma.__prismaUnavailableClient = makeProxy('') as unknown as PrismaClient;
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

export const prisma: PrismaClient = prismaClient as PrismaClient;
export const isPrismaAvailable = Boolean(databaseUrl);
