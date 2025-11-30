import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const result = await checkAccess("PROJECTS", "READ");

  if (!result.authorized) {
    return Response.json(
      {
        state: "error",
        message: result.message,
      },
      { status: 403 },
    );
  }

  const clientId = getIdFromUrl(req.url, 2) as string;

  const projects = await prisma.project.findMany({
    where: {
      clientId,
    },
    include: {
      company: true,
      client: true,
    },
  });

  return NextResponse.json(
    {
      state: "success",
      data: projects,
    },
    { status: 200 },
  );
}
