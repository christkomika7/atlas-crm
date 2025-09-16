import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getSession();

  if (data?.session) {
    return redirect("/overview");
  }
  return <div className="mx-auto w-full max-w-[1920px]">{children}</div>;
}
