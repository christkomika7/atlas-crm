import { getSession } from "@/lib/auth-client";
import { $Enums, Resource } from "@/lib/generated/prisma";
import { hasAccess } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useAccess(resource: Resource, action: $Enums.Action | $Enums.Action[]) {
    const session = getSession();
    const [access, setAccess] = useState(false)


    useEffect(() => {
        if (session) {
            const profile = session.data?.user.currentProfile as string;
            const permissions = session.data?.user.profiles?.find(p => p.id === profile)?.permissions || [];
            console.log({ permissions, hasAccess: hasAccess(resource, action, permissions) })
            setAccess(hasAccess(resource, action, permissions));

        }
    }, [session])

    return access
}