import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { editBillboardFormSchema, EditBillboardSchemaFormType, EditBillboardSchemaType, EditLessorSchemaType } from "@/lib/zod/billboard.schema";
import { BillboardType } from "@/types/billboard.types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;

    const billboards = await prisma.billboard.findMany({
        where: {
            companyId: id,
        },
        include: {
            company: true,
            type: true
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: billboards.map(billboard => ({
                ...billboard,
                contractDuration: [billboard?.contractStart, billboard?.contractEnd],
                locationDuration: [billboard?.locationStart, billboard?.locationEnd],
            })),
        },
        { status: 200 }
    );
}

export async function PUT(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "CREATE");

    const id = getIdFromUrl(req.url, "last") as string;
    const billboard = await checkData(prisma.billboard, { where: { id } }, "identifiant") as BillboardType;

    const formData = await req.formData();

    const filesMap: Record<string, File[]> = {};
    const rawData: Record<string, any> = {};

    // Récupération données & fichiers
    formData.forEach((value, key) => {
        if (value instanceof File) {
            if (!filesMap[key]) filesMap[key] = [];
            filesMap[key].push(value);
        } else {
            rawData[key] = value;
        }
    });

    const billboardFields = [
        "id", "companyId", "reference", "type", "name", "dimension", "placement", "city",
        "orientation", "information", "address", "gmaps", "zone", "visibility",
        "rentalPrice", "installationCost", "maintenance", "structure", "decorativeElement",
        "foundations", "technicalVisibility", "note", "lastImageFiles", "lastBrochureFiles",
    ];

    const lessorFields = [
        "lessorType", "lessorName", "lessorJob", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "lessorAddress",
        "representativeName", "representativeContract", "leasedSpace", "paymentMethod",
        "specificCondition", "lastSignedLeaseContract", "lastFiles"
    ];

    const billboardData: Record<string, any> = {};
    const lessorData: Record<string, any> = {};

    for (const key in rawData) {
        if (billboardFields.includes(key)) {
            billboardData[key] = rawData[key];
        } else if (lessorFields.includes(key)) {
            lessorData[key] = rawData[key];
        }
    }

    // Conversion des dates
    lessorData.contractDuration = rawData["contractFrom"] && rawData["contractTo"] ? {
        from: new Date(rawData["contractFrom"]),
        to: new Date(rawData["contractTo"]),
    } : undefined;

    console.log({ contractDuration: lessorData.contractDuration })

    // Fichiers uploadés
    billboardData.imageFiles = filesMap["imageFiles"] ?? [];
    billboardData.brochureFiles = filesMap["brochureFiles"] ?? [];
    lessorData.signedLeaseContract = filesMap["signedLeaseContract"] ?? [];
    lessorData.files = filesMap["files"] ?? [];

    // Conversion des anciens fichiers en tableau
    const dataToValidate = {
        billboard: {
            ...(billboardData as EditBillboardSchemaType),
            lastImageFiles: billboardData.lastImageFiles ? billboardData.lastImageFiles.split(";") : [],
            lastBrochureFiles: billboardData.lastBrochureFiles ? billboardData.lastBrochureFiles.split(";") : []
        },
        lessor: {
            ...(lessorData as EditLessorSchemaType),
            lastSignedLeaseContract: lessorData.lastSignedLeaseContract ? lessorData.lastSignedLeaseContract.split(";") : [],
            lastFiles: lessorData.lastFiles ? lessorData.lastFiles.split(";") : []
        }
    };

    const data = parseData<EditBillboardSchemaFormType>(
        editBillboardFormSchema,
        dataToValidate as EditBillboardSchemaFormType
    ) as EditBillboardSchemaFormType;

    // Vérifications préalables
    const [companyExist, nameExist, refExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.billboard.companyId } }),
        prisma.billboard.findUnique({ where: { name: data.billboard.name } }),
        prisma.billboard.findUnique({ where: { reference: data.billboard.reference } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({ status: "error", message: "Société introuvable." }, { status: 404 });
    }
    if (nameExist && nameExist.id !== data.billboard.id) {
        return NextResponse.json({ status: "error", message: "Nom déjà utilisé." }, { status: 400 });
    }
    if (refExist && refExist.id !== data.billboard.id) {
        return NextResponse.json({ status: "error", message: "Référence déjà utilisée." }, { status: 400 });
    }

    // Création dossiers
    const folderPhoto = createFolder([companyExist.companyName, "billboard", "photo", `${data.billboard.name}_----${billboard.pathPhoto.split("_----")[1]}`]);
    const folderBrochure = createFolder([companyExist.companyName, "billboard", "brochure", `${data.billboard.name}_----${billboard.pathBrochure.split("_----")[1]}`]);
    const folderContract = createFolder([companyExist.companyName, "billboard", "contract", `${data.billboard.name}_----${billboard.pathContract.split("_----")[1]}`]);
    const folderOther = createFolder([companyExist.companyName, "billboard", "other", `${data.billboard.name}_----${billboard.pathFile.split("_----")[1]}`]);

    // Sauvegarde fichiers
    let savedPathsContract: string[] = await updateFiles({ folder: folderContract, outdatedData: { id: billboard.id, path: billboard.pathContract, files: billboard.signedLeaseContract }, updatedData: { id: data.billboard.id, lastUploadDocuments: data.lessor.lastSignedLeaseContract }, files: data.lessor.signedLeaseContract ?? [] });
    let savedPathsOther: string[] = await updateFiles({ folder: folderOther, outdatedData: { id: billboard.id, path: billboard.pathFile, files: billboard.files }, updatedData: { id: data.billboard.id, lastUploadDocuments: data.lessor.lastFiles }, files: data.lessor.files ?? [] });
    let savedPathsPhoto: string[] = await updateFiles({ folder: folderPhoto, outdatedData: { id: billboard.id, path: billboard.pathPhoto, files: billboard.imageFiles }, updatedData: { id: data.billboard.id, lastUploadDocuments: data.billboard.lastImageFiles }, files: data.billboard.imageFiles ?? [] });
    let savedPathsBrochure: string[] = await updateFiles({ folder: folderBrochure, outdatedData: { id: billboard.id, path: billboard.pathBrochure, files: billboard.brochureFiles }, updatedData: { id: data.billboard.id, lastUploadDocuments: data.billboard.lastBrochureFiles }, files: data.billboard.brochureFiles ?? [] });

    try {
        const updatedBillboard = await prisma.billboard.update({
            where: {
                id: data.billboard.id
            },
            data: {
                pathBrochure: folderBrochure,
                pathContract: folderContract,
                pathFile: folderOther,
                pathPhoto: folderPhoto,
                reference: data.billboard.reference,
                type: {
                    connect: {
                        id: data.billboard.type
                    }
                },
                name: data.billboard.name,
                dimension: data.billboard.dimension,
                city: { connect: { id: data.billboard.city } },
                placement: { connect: { id: data.billboard.placement } },
                orientation: data.billboard.orientation,
                information: data.billboard.information,
                address: data.billboard.address,
                gmaps: data.billboard.gmaps,
                zone: data.billboard.zone,
                visibility: data.billboard.visibility,
                rentalPrice: data.billboard.rentalPrice,
                installationCost: data.billboard.installationCost,
                maintenance: data.billboard.maintenance,
                imageFiles: savedPathsPhoto,
                brochureFiles: savedPathsBrochure,
                structure: data.billboard.structure,
                decorativeElement: data.billboard.decorativeElement,
                foundations: data.billboard.foundations,
                technicalVisibility: data.billboard.technicalVisibility,
                note: data.billboard.note,

                lessorType: data.lessor.lessorType,
                lessorName: data.lessor.lessorName,
                lessorEmail: data.lessor.lessorEmail,
                lessorJob: data.lessor.lessorJob,
                lessorPhone: data.lessor.lessorPhone,
                capital: data.lessor.capital,
                rccm: data.lessor.rccm,

                taxIdentificationNumber: data.lessor.taxIdentificationNumber,
                lessorAddress: data.lessor.lessorAddress,
                representativeName: data.lessor.representativeName,
                representativeContract: data.lessor.representativeContract,
                leasedSpace: data.lessor.leasedSpace,
                contractStart: data.lessor.contractDuration?.from ?? null,
                contractEnd: data.lessor.contractDuration?.to ?? null,
                paymentMethod: data.lessor.paymentMethod,
                specificCondition: data.lessor.specificCondition,
                signedLeaseContract: savedPathsContract,
                files: savedPathsOther,
                company: { connect: { id: data.billboard.companyId } },
            },
        });

        return NextResponse.json({
            status: "success",
            message: "Panneau modifié avec succès.",
            data: {
                ...updatedBillboard,
                contractDuration: [updatedBillboard?.contractStart, updatedBillboard?.contractEnd],
                locationDuration: [updatedBillboard?.locationStart, updatedBillboard?.locationEnd],

            },
        });

    } catch (error) {
        await removePath([...savedPathsPhoto, ...savedPathsBrochure, ...savedPathsContract, ...savedPathsOther]);
        return NextResponse.json({ status: "error", message: "Erreur lors de la modification." }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const billboard = await prisma.billboard.findUnique({
        where: { id },
    });

    if (!billboard) {
        return NextResponse.json({
            message: "Rendez-vous introuvable.",
            state: "error",
        }, { status: 400 })
    }

    await prisma.billboard.delete({ where: { id } });
    await removePath(billboard.imageFiles)
    await removePath(billboard.brochureFiles)
    await removePath(billboard.signedLeaseContract)
    await removePath(billboard.files)
    return NextResponse.json({
        state: "success",
        message: "Panneau publicitaire supprimé avec succès.",
    }, { status: 200 }
    )
}