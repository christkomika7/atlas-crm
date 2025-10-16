import { PermissionType } from "@/types/user.types";

type StructuredPermissions = {
    [key: string]: {
        read: boolean;
        create: boolean;
        edit: boolean;
    };
};

export function formatPermissions(permissions: PermissionType[]): StructuredPermissions {
    return permissions.reduce((acc, permission) => {
        const key = permission.resource
            .toLowerCase()
            .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        acc[key] = {
            read: permission.actions.includes("READ"),
            create: permission.actions.includes("CREATE"),
            edit: permission.actions.includes("MODIFY"),
        };

        return acc;
    }, {} as StructuredPermissions);
}
