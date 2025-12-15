import { checkAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { PeriodType } from "@/types/company.types";
import { NextResponse, type NextRequest } from "next/server";
import { filters } from "@/lib/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("SETTING", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const companyId = getIdFromUrl(req.url, 2) as string;
    const period = req.nextUrl.searchParams.get("period")?.trim() as PeriodType | undefined;
    const start = req.nextUrl.searchParams.get("start")?.trim();
    const end = req.nextUrl.searchParams.get("end")?.trim();

    if (!companyId) {
        return NextResponse.json(
            { state: "error", message: "Aucun identifiant de société fourni." },
            { status: 404 }
        );
    }

    try {
        const data = await filters({ companyId, start, end, period, reportType: "salesByClient" });
        return NextResponse.json({ state: "success", data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { state: "error", message: error instanceof Error ? error.message : "Erreur inconnue" },
            { status: 400 }
        );
    }
}