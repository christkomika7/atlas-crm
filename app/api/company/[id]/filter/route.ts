import { checkAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { PeriodType, ReportType } from "@/types/company.types";
import { NextResponse, type NextRequest } from "next/server";
import { filters } from "@/lib/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("SETTING", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const companyId = getIdFromUrl(req.url, 2) as string;
    const reportType = req.nextUrl.searchParams.get("reportType")?.trim() as ReportType | undefined;
    const period = req.nextUrl.searchParams.get("period")?.trim() as PeriodType | undefined;
    const start = req.nextUrl.searchParams.get("start")?.trim();
    const end = req.nextUrl.searchParams.get("end")?.trim();

    if (!companyId) {
        return NextResponse.json(
            { state: "error", message: "Aucun identifiant de société fourni." },
            { status: 404 }
        );
    }

    if (!reportType) {
        const invoices = await filters({ companyId, start, end, period, reportType: "salesByClient" });
        return NextResponse.json({ state: "success", data: invoices }, { status: 200 });
    }

    const datas = await filters({ companyId, start, end, period, reportType });

    return NextResponse.json({ state: "success", data: datas }, { status: 200 });
}


