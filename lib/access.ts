import { getSession } from "./auth";
import { $Enums } from "./generated/prisma";
import { authorize } from "./authorize";
import prisma from "./prisma";

export async function checkAccess(
    resource: $Enums.Resource | $Enums.Resource[],
    action: $Enums.Action | $Enums.Action[],
): Promise<{ authorized: boolean; message: string }> {


    const sessionData = await getSession();

    if (!sessionData) {
        return {
            authorized: false,
            message: "Accès refusé",
        };
    }

    const profileId = sessionData.user.currentProfile;
    const userId = sessionData.user.id || sessionData.session.userId;
    const role = sessionData.user.role || $Enums.Role.USER;

    if (!userId) {
        return {
            authorized: false,
            message: "Accès refusé : aucune donnée trouvée",
        };
    }

    if (!profileId) {
        const result = authorize({
            resource,
            action,
            userPermissions: [],
            role: $Enums.Role.ADMIN,
        });

        return {
            authorized: result.authorized,
            message: result.message,
        };
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            include: { permissions: true },
        });

        if (!profile) {
            return {
                authorized: false,
                message: "Profil utilisateur non trouvé",
            };
        }

        const result = authorize({
            resource,
            action,
            userPermissions: profile.permissions,
            role,
        });

        return {
            authorized: result.authorized,
            message: result.message,
        };

    } catch (error) {
        console.error("Erreur lors de la vérification des accès:", error);

        return {
            authorized: false,
            message: "Erreur lors de la vérification des accès",
        };
    }
}


export async function sessionAccess() {
    const data = await getSession();

    if (!data) {
        return {
            hasSession: false,
            userId: null
        }

    }

    return {
        hasSession: true,
        userId: data.user.id || data.session.userId
    }
}