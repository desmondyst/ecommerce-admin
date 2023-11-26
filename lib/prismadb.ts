import { PrismaClient } from "@prisma/client";

/**
 * This declares a global variable prisma of type PrismaClient | undefined. The | undefined indicates that the variable can be either an instance of PrismaClient or undefined. This declaration is necessary for TypeScript to recognize the global variable.
 */
declare global {
    var prisma: PrismaClient | undefined;
}

// globalThis is a global object in JavaScript that provides a standard way of accessing the global object across different environments.
const prismadb = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    // if we are in DEV, we don't want to intialise Prisma client every single time
    globalThis.prisma = prismadb;
}

export default prismadb;
