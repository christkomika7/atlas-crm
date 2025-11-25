import Logo from "@/components/logo";
import SidebarMenu from "@/components/menu/sidebar-menu";
import { website } from "@/config/website";
import { getSession } from "@/lib/auth";
import { assertUserCanAccessPage, isRestrictedToAdminPath } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { ScrollArea } from "@/components/ui/scroll-area";
import prisma from "@/lib/prisma";

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
  // assertUserCanAccessPage(data.user, pathname);

  const profile = await prisma.profile.findFirst({
    where: { id: data.user.currentProfile as string },
    include: {
      permissions: true
    }
  });

  const permissions = profile?.permissions;

  // console.log(JSON.stringify(permissions, null, 2));

  return (
    <div className="relative grid grid-cols-[260px_1fr] bg-dark w-screen h-screen">
      <div className="flex flex-col space-y-6 p-6 h-full overflow-y-auto">
        <div className="flex flex-shrink-0 justify-center">
          <Logo width={200} height={55} />
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[calc(100vh-150px)] pl-3" dir="rtl">
            <div dir="ltr">
              <SidebarMenu
                id={data.user?.id as string}
                currentCompany={data.user?.currentCompany ?? ""}
                currency={data.user.currency ?? ""}
                role={data.user?.role}
                permissions={permissions}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="relative bg-white p-2 rounded-tl-4xl rounded-bl-4xl w-(sidebar-width) h-svh overflow-hidden">
        <ScrollArea className="h-full pr-2">
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
