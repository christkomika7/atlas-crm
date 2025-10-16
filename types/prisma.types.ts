import { PrismaClient } from "@/lib/generated/prisma";

export type ModelDelegate<M extends keyof PrismaClient> =
    PrismaClient[M] extends { findFirst(args: infer A): infer R }
    ? { findFirst(args: A): R }
    : never;