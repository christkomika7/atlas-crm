import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { copyTo, createFolder, removePath, updateFiles } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { editBillboardFormSchema, EditBillboardSchemaFormType, EditBillboardSchemaType, EditLessorSchemaType } from "@/lib/zod/billboard.schema";
import { BillboardType } from "@/types/billboard.types";
import { Decimal } from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "READ");

    try {
        const id = getIdFromUrl(req.url, "last") as string;

        const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
        const rawLimit = req.nextUrl.searchParams.get("limit") ?? "";
        const DEFAULT_LIMIT = 50;
        const MAX_LIMIT = 200;

        let limit = DEFAULT_LIMIT;
        if (rawLimit) {
            const parsed = Number(rawLimit);
            if (!Number.isNaN(parsed) && parsed > 0) {
                limit = Math.min(parsed, MAX_LIMIT);
            }
        }

        const baseWhere: any = { companyId: id };

        if (search) {
            const searchTerms = search.split(/\s+/).filter(Boolean);
            baseWhere.OR = [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    OR: searchTerms.map((term) => ({
                        information: {
                            contains: term,
                            mode: "insensitive",
                        },
                    })),
                },
            ];
        }

        const billboards = await prisma.billboard.findMany({
            where: baseWhere,
            include: {
                company: true,
                type: true,
                items: { where: { state: "APPROVED" } },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(
            {
                state: "success",
                data: billboards.map((billboard) => ({
                    ...billboard,
                    contractDuration: [billboard?.contractStart, billboard?.contractEnd],
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur GET /api/billboard:", error);
        return NextResponse.json(
            { state: "error", message: "Erreur lors de la récupération des panneaux publicitaires." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "CREATE");
    const id = getIdFromUrl(req.url, "last") as string;

    const billboard = await prisma.billboard.findUnique({
        where: { id },
        include: {
            company: true,
            lessorSupplier: true,
        }
    });

    if (!billboard) {
        return NextResponse.json({
            state: "error",
            message: "Aucun panneau d'affichage trouvé."
        }, {
            status: 400
        })
    }

    const key = generateId();

    const folderPhoto = createFolder([billboard.company.companyName, "billboard", "photo", `${billboard.name}_----${key}`]);
    const folderBrochure = createFolder([billboard.company.companyName, "billboard", "brochure", `${billboard.name}_----${key}`]);
    const folderContract = createFolder([billboard.company.companyName, "billboard", "contract", `${billboard.name}_----${key}`]);
    const folderOther = createFolder([billboard.company.companyName, "billboard", "other", `${billboard.name}_----${key}`]);

    let savedPathsPhoto: string[] = await copyTo(billboard.imageFiles, folderPhoto);
    let savedPathsBrochure: string[] = await copyTo(billboard.brochureFiles, folderBrochure);
    let savedPathsContract: string[] = await copyTo(billboard.signedLeaseContract, folderContract);
    let savedPathsOther: string[] = await copyTo(billboard.files, folderOther);

    try {

        if (billboard.lessorSpaceType === "private") {
            await prisma.billboard.create({
                data: {
                    reference: key,
                    pathBrochure: folderBrochure,
                    pathContract: folderContract,
                    pathFile: folderOther,
                    pathPhoto: folderPhoto,
                    type: {
                        connect: {
                            id: billboard.typeId
                        }
                    },
                    name: billboard.name,
                    dimension: billboard.dimension,
                    city: { connect: { id: billboard.cityId } },
                    area: { connect: { id: billboard.areaId } },
                    placement: billboard.placement,
                    orientation: billboard.orientation,
                    information: billboard.information,
                    address: billboard.address,
                    gmaps: billboard.gmaps,
                    zone: billboard.zone,
                    rentalPrice: billboard.rentalPrice,
                    installationCost: billboard.installationCost,
                    maintenance: billboard.maintenance,
                    imageFiles: savedPathsPhoto,
                    brochureFiles: savedPathsBrochure,
                    structure: billboard.structure,
                    decorativeElement: billboard.decorativeElement,
                    foundations: billboard.foundations,
                    technicalVisibility: billboard.technicalVisibility,
                    note: billboard.note,

                    lessorSpaceType: billboard.lessorSpaceType,
                    lessorType: billboard.lessorType,
                    lessorName: billboard.lessorName,
                    lessorEmail: billboard.lessorEmail,
                    lessorJob: billboard.lessorJob,
                    lessorPhone: billboard.lessorPhone,
                    capital: billboard.capital,
                    rccm: billboard.rccm,

                    taxIdentificationNumber: billboard.taxIdentificationNumber,
                    lessorAddress: billboard.lessorAddress,
                    representativeName: billboard.representativeName,
                    representativeContract: billboard.representativeContract,
                    leasedSpace: billboard.leasedSpace,
                    contractStart: billboard.contractStart,
                    contractEnd: billboard.contractEnd,
                    paymentMethod: billboard.paymentMethod,
                    specificCondition: billboard.specificCondition,
                    signedLeaseContract: savedPathsContract,
                    files: savedPathsOther,
                    company: { connect: { id: billboard.companyId } },
                },
            });

        } else {
            await prisma.billboard.create({
                data: {
                    reference: key,
                    pathBrochure: folderBrochure,
                    pathContract: folderContract,
                    pathFile: folderOther,
                    pathPhoto: folderPhoto,
                    type: {
                        connect: {
                            id: billboard.typeId
                        }
                    },
                    name: billboard.name,
                    dimension: billboard.dimension,
                    city: { connect: { id: billboard.cityId } },
                    area: { connect: { id: billboard.areaId } },
                    placement: billboard.placement,
                    orientation: billboard.orientation,
                    information: billboard.information,
                    address: billboard.address,
                    gmaps: billboard.gmaps,
                    zone: billboard.zone,
                    rentalPrice: billboard.rentalPrice,
                    installationCost: billboard.installationCost,
                    maintenance: billboard.maintenance,
                    imageFiles: savedPathsPhoto,
                    brochureFiles: savedPathsBrochure,
                    structure: billboard.structure,
                    decorativeElement: billboard.decorativeElement,
                    foundations: billboard.foundations,
                    technicalVisibility: billboard.technicalVisibility,
                    note: billboard.note,

                    lessorType: billboard.lessorType,
                    lessorSpaceType: billboard.lessorSpaceType,
                    lessorSupplier: {
                        connect: {
                            id: billboard.lessorSupplierId as string
                        }
                    },
                    signedLeaseContract: savedPathsContract,
                    files: savedPathsOther,
                    company: { connect: { id: billboard.companyId } },
                },
            });
        }

        return NextResponse.json({
            status: "success",
            message: "Panneau a été dupliqué avec succès.",
        });

    }
    catch (error) {

        await removePath([
            ...savedPathsPhoto,
            ...savedPathsBrochure,
            ...savedPathsContract,
            ...savedPathsOther
        ]);

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de le la duplication du panneau.",
        }, { status: 500 });

    }








}

export async function PUT(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "MODIFY");

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
        "id", "companyId", "reference", "type", "name", "dimension", "placement", "city", "area",
        "orientation", "information", "address", "gmaps", "zone",
        "rentalPrice", "installationCost", "maintenance", "structure", "decorativeElement",
        "foundations", "technicalVisibility", "note", "lastImageFiles", "lastBrochureFiles", "hasTax"
    ];

    const lessorFields = [
        "lessorType", "lessorName", "lessorJob", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "lessorAddress",
        "representativeName", "representativeContract", "leasedSpace", "paymentMethod",
        "specificCondition", "lastSignedLeaseContract", "lastFiles", "lessorCustomer", "lessorSpaceType"
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

    // Fichiers uploadés
    billboardData.imageFiles = filesMap["imageFiles"] ?? [];
    billboardData.brochureFiles = filesMap["brochureFiles"] ?? [];
    lessorData.signedLeaseContract = filesMap["signedLeaseContract"] ?? [];
    lessorData.files = filesMap["files"] ?? [];

    // Conversion des anciens fichiers en tableau
    const dataToValidate = {
        billboard: {
            ...(billboardData as EditBillboardSchemaType),
            hasTax: JSON.parse(billboardData.hasTax),
            lastImageFiles: billboardData.lastImageFiles ? billboardData.lastImageFiles.split(";") : [],
            lastBrochureFiles: billboardData.lastBrochureFiles ? billboardData.lastBrochureFiles.split(";") : [],
            rentalPrice: new Decimal(billboardData.rentalPrice),
            installationCost: new Decimal(billboardData.installationCost),
            maintenance: new Decimal(billboardData.maintenance),
        },
        lessor: {
            ...(lessorData as EditLessorSchemaType),
            lastSignedLeaseContract: lessorData.lastSignedLeaseContract ? lessorData.lastSignedLeaseContract.split(";") : [],
            lastFiles: lessorData.lastFiles ? lessorData.lastFiles.split(";") : [],
            capital: new Decimal(lessorData.capital || 0)
        }
    };


    const data = parseData<EditBillboardSchemaFormType>(
        editBillboardFormSchema,
        dataToValidate as EditBillboardSchemaFormType
    ) as EditBillboardSchemaFormType;

    // Vérifications préalables
    const [companyExist, refExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.billboard.companyId } }),
        prisma.billboard.findUnique({ where: { reference: data.billboard.reference } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({ status: "error", message: "Société introuvable." }, { status: 404 });
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
                hasTax: data.billboard.hasTax,
                type: {
                    connect: {
                        id: data.billboard.type
                    }
                },
                name: data.billboard.name,
                dimension: data.billboard.dimension,
                city: { connect: { id: data.billboard.city } },
                area: { connect: { id: data.billboard.area } },
                placement: data.billboard.placement,
                orientation: data.billboard.orientation,
                information: data.billboard.information,
                address: data.billboard.address,
                gmaps: data.billboard.gmaps,
                zone: data.billboard.zone,
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
                lessorSpaceType: data.lessor.lessorSpaceType,
                ...(data.lessor.lessorSpaceType === "public" ? {
                    lessorSupplier: {
                        connect: {
                            id: data.lessor.lessorCustomer
                        }
                    },
                } : {
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
                }),
                company: { connect: { id: data.billboard.companyId } },
            },
        });

        return NextResponse.json({
            status: "success",
            message: "Panneau modifié avec succès.",
            data: {
                ...updatedBillboard,
                contractDuration: [updatedBillboard?.contractStart, updatedBillboard?.contractEnd],
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