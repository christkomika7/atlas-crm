import Logo from "@/components/logo";
import SidebarMenu from "@/components/menu/sidebar-menu";
import { website } from "@/config/website";
import { getSession } from "@/lib/auth";
import { isRestrictedToAdminPath } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") || "";
  const data = await getSession();

  const canAccess = isRestrictedToAdminPath(
    data?.user?.role === "ADMIN",
    website.adminOnlyPaths,
    pathname
  );

  if (!canAccess) {
    notFound();
  }

  if (!data?.session) {
    return redirect("/");
  }

  return (
    <div className="relative grid grid-cols-[260px_1fr] bg-dark w-screen h-screen">
      <div className="flex flex-col space-y-6 p-6 h-full overflow-y-auto">
        <div className="flex flex-shrink-0 justify-center">
          <Logo color="white" />
        </div>
        <div className="flex-1 overflow-hidden">
          <SidebarMenu
            id={data.user?.id as string}
            currentCompany={data.user?.currentCompany ?? ""}
            currency={data.user.currency ?? ""}
            role={data.user?.role}
            permissions={data.user?.permissions}
          />
        </div>
      </div>
      <div className="relative bg-white p-4 rounded-tl-4xl rounded-bl-4xl w-(sidebar-width) h-svh overflow-hidden">
        <ScrollArea className="h-full pr-2">
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
