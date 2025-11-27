"use client";

import { getSession } from "@/lib/auth-client";
import { $Enums, Resource } from "@/lib/generated/prisma";
import { hasAccess } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useAccess(
    resource: Resource,
    action: $Enums.Action | $Enums.Action[]
) {
    const [loading, setLoading] = useState(true);
    const [access, setAccess] = useState(false);

    const session = getSession();

    useEffect(() => {
        if (!session || session.isPending) {
            setLoading(true);
            return;
        }

        if (session.data) {
            const role = session.data.user.role || "USER";
            const profile = session.data.user.currentProfile as string;
            const permissions =
                session.data.user.profiles?.find((p) => p.id === profile)
                    ?.permissions || [];

            const ok = hasAccess(resource, action, permissions, role);

            setAccess(ok);
            setLoading(false);
        }

        if (!session.data) {
            setAccess(false);
            setLoading(false);
        }
    }, [session, resource, action]);

    return { loading, access };
}
