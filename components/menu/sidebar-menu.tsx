"use client";

import { website } from "@/config/website";
import { $Enums, Role } from "@/lib/generated/prisma";
import { isRestrictedToAdminPath } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import clsx from "clsx";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { useEffect } from "react";

type SidebarMenuProps = {
  id: string;
  role: string | null | undefined;
  currentCompany: string;
  currency: string;
  permissions:
  | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    resource: $Enums.Resource;
    actions: $Enums.Action[];
  }[]
  | undefined;
};

export default function SidebarMenu({
  id,
  role,
  permissions,
  currentCompany,
  currency,
}: SidebarMenuProps) {
  const setId = useDataStore.use.setId();
  const setRole = useDataStore.use.setRole();
  const setCurrentCompany = useDataStore.use.setCurrentCompany();

  const setCurrency = useDataStore.use.setCurrency();
  const path = usePathname();

  useEffect(() => {
    if (id) setId(id);
  }, [id]);

  useEffect(() => {
    if (currentCompany) {
      setCurrentCompany(currentCompany);
    }
  }, [currentCompany]);

  useEffect(() => {
    if (currency) {
      setCurrency(currency);
    }
  }, [currency]);

  useEffect(() => {
    if (role) setRole(role as Role);
  }, [role]);

  const canAccess = isRestrictedToAdminPath(
    role === "ADMIN",
    website.adminOnlyPaths,
    path
  );

  if (!canAccess) {
    notFound();
  }

  const hasPermission = (resource: $Enums.Resource) => {
    if (role === "ADMIN") return true;
    const found = permissions?.find((p) => p.resource === resource);
    return !!found && found.actions.length > 0;
  };

  return (
    <ul className="space-y-0.5">
      {website.sidebarMenu.map((menu) => {
        if (!hasPermission(menu.resource as $Enums.Resource)) return null;

        return (
          <li key={menu.id}>
            <Link
              href={menu.path}
              className={clsx(
                "flex items-center gap-x-2 hover:bg-white/10 px-4 py-2 rounded-lg font-medium text-white text-sm",
                path.startsWith(menu.path) && "bg-blue hover:!bg-blue"
              )}
            >
              <span className="flex w-5 h-5">{menu.icon}</span>
              {menu.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
