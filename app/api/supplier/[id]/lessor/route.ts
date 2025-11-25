import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";
import Decimal from "decimal.js";

export async function GET(req: NextRequest) {
    const result = await checkAccess("CONTRACT", ["MODIFY", "CREATE"]);

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const companyExist = await prisma.company.findUnique({ where: { id } });
    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }


    const [suppliers, lessors] = await prisma.$transaction([
        prisma.supplier.findMany({
            where: {
                companyId: id,
            },
            include: {
                company: true
            }
        }),
        prisma.billboard.findMany({
            where: {
                companyId: id,
                lessorSpaceType: 'private'
            },
            include: {
                company: true
            }
        })
    ]);

    const formatSuppliers = suppliers.map(supplier => ({
        id: supplier.id,
        type: "supplier",
        company: supplier.companyName,
        legalForm: supplier.legalForms,
        capital: supplier.capital,
        taxIdentificationNumber: supplier.taxIdentificationNumber,
        address: supplier.address,
        representativeName: supplier.firstname + " " + supplier.lastname,
        representativeJob: supplier.job,
    }));

    const formatLessors = lessors.map(lessor => ({
        id: lessor.id,
        type: "lessor",
        company: lessor.lessorName || "",
        legalForm: lessor.legalForms,
        capital: new Decimal(lessor.capital?.toString() || 0).toString(),
        taxIdentificationNumber: lessor.taxIdentificationNumber || "",
        address: lessor.lessorAddress || "",
        representativeName: lessor.representativeFirstName + " " + lessor.representativeLastName,
        representativeJob: lessor.representativeJob || "",
    }));



    return NextResponse.json({
        state: "success",
        data: [...formatLessors, ...formatSuppliers],
    }, { status: 200 })
}