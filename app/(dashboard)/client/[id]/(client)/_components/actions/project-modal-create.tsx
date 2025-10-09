"use client";

import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectModalCreate() {
  const param = useParams();

  return (
    <div>
      <Link href={`/client/${param.id}/project/create`}>
        <Button
          variant="primary"
          className="flex justify-center items-center w-fit font-medium"
        >
          Nouveau projet
        </Button>
      </Link>
    </div>
  );
}
