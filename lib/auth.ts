import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { cache } from "react";
import { headers } from "next/headers";
import { customSession, multiSession } from "better-auth/plugins";

import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        customSession(async ({ user, session }) => {
            const newUser = await prisma.user.findUnique({
                where: {
                    email: user.email
                },
                include: {
                    profiles: {
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            if (newUser && newUser.currentCompany) {
                const company = await prisma.company.findUnique({
                    where: { id: newUser.currentCompany },
                    select: {
                        currency: true,
                    }
                })

                return {
                    user: {
                        ...newUser,
                        currency: company?.currency
                    },
                    session
                }

            }


            return {
                user: { ...newUser, currency: "" },
                session
            }

        }),
        multiSession()
    ],
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
            },
            emailVerified: {
                type: "boolean",
                required: false,
            },
        }
    },
    rateLimit: {
        storage: "database",
        modelName: "rateLimit",
        enabled: true,
        window: 10,
        max: 100,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        freshAge: 60 * 24,
    },
    advanced: {
        useSecureCookies: true
    },

});

export type AuthSession = typeof auth.$Infer.Session


export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers()
    })
})