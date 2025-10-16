import { LogOutIcon } from "lucide-react";
import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import Spinner from "./ui/spinner";
import { redirect } from "next/navigation";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      const result = await authClient.signOut();
      if (result.data?.success) {
        redirect("/");
      }
    });
  }
  return (
    <Button
      onClick={logout}
      variant="destructive"
      className="rounded-lg w-fit !h-10 cursor-pointer"
    >
      {isPending && <Spinner />}
      {!isPending && (
        <>
          <LogOutIcon /> Déconnexion
        </>
      )}
    </Button>
  );
}
