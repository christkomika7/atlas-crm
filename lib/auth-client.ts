import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_AUTH_URL!,
    plugins: [customSessionClient<typeof auth>()],
});

export function getSession() {
    return authClient.useSession();
}