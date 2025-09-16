import { $Enums } from "@/lib/generated/prisma";

export type SidebarMenuType = {
    id: number;
    icon: React.JSX.Element;
    title: string;
    path: string;
    resource: $Enums.Resource
}

export type WebsiteType = {
    sidebarMenu: SidebarMenuType[]
    adminOnlyPaths: string[]
}