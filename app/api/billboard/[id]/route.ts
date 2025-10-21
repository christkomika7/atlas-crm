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

    let savedPathsPhoto: string[] = await copyTo(billboard.photos, folderPhoto);
    let savedPathsBrochure: string[] = await copyTo(billboard.brochures, folderBrochure);

    try {

        if (billboard.lessorSpaceType === "private") {
            await prisma.billboard.create({
                data: {
                    reference: key,
                    hasTax: billboard.hasTax,
                    type: {
                        connect: {
                            id: billboard.typeId
                        }
                    },
                    name: billboard.name,
                    locality: billboard.locality,
                    zone: billboard.zone,
                    area: { connect: { id: billboard.areaId } },
                    visualMarker: billboard.visualMarker,
                    displayBoard: { connect: { id: billboard.displayBoardId } },

                    address: billboard.address,
                    city: { connect: { id: billboard.cityId } },
                    orientation: billboard.orientation,
                    gmaps: billboard.gmaps,

                    pathPhoto: folderPhoto,
                    pathBrochure: folderBrochure,
                    photos: savedPathsPhoto,
                    brochures: savedPathsBrochure,

                    rentalPrice: billboard.rentalPrice,
                    installationCost: billboard.installationCost,
                    maintenance: billboard.maintenance,

                    width: billboard.width,
                    height: billboard.height,
                    lighting: billboard.lighting,
                    structureType: { connect: { id: billboard.structureTypeId } },
                    panelCondition: billboard.panelCondition,
                    decorativeElement: billboard.decorativeElement,
                    foundations: billboard.foundations,
                    electricity: billboard.electricity,
                    framework: billboard.framework,
                    note: billboard.note,

                    lessorSpaceType: billboard.lessorSpaceType,
                    lessorType: { connect: { id: billboard.lessorTypeId } },

                    lessorName: billboard.lessorName,
                    lessorAddress: billboard.lessorAddress,
                    lessorCity: billboard.lessorCity,
                    lessorPhone: billboard.lessorPhone,
                    lessorEmail: billboard.lessorEmail,

                    capital: billboard.capital,
                    rccm: billboard.rccm,
                    taxIdentificationNumber: billboard.taxIdentificationNumber,
                    bankName: billboard.bankName,
                    rib: billboard.rib,
                    iban: billboard.iban,
                    bicSwift: billboard.bicSwift,

                    representativeFirstName: billboard.representativeFirstName,
                    representativeLastName: billboard.representativeLastName,
                    representativeJob: billboard.representativeJob,
                    representativePhone: billboard.representativePhone,
                    representativeEmail: billboard.representativeEmail,

                    rentalStartDate: billboard.rentalStartDate,
                    rentalPeriod: billboard.rentalPeriod,
                    paymentMode: billboard.paymentMode,
                    paymentFrequency: billboard.paymentFrequency,
                    electricitySupply: billboard.electricitySupply,
                    specificCondition: billboard.specificCondition,
                    company: { connect: { id: billboard.companyId } },
                },
            });

        } else {
            await prisma.billboard.create({
                data: {
                    reference: key,
                    hasTax: billboard.hasTax,
                    type: {
                        connect: {
                            id: billboard.typeId
                        }
                    },
                    name: billboard.name,
                    locality: billboard.locality,
                    zone: billboard.zone,
                    area: { connect: { id: billboard.areaId } },
                    visualMarker: billboard.visualMarker,
                    displayBoard: { connect: { id: billboard.displayBoardId } },

                    address: billboard.address,
                    city: { connect: { id: billboard.cityId } },
                    orientation: billboard.orientation,
                    gmaps: billboard.gmaps,

                    pathPhoto: folderPhoto,
                    pathBrochure: folderBrochure,
                    photos: savedPathsPhoto,
                    brochures: savedPathsBrochure,

                    rentalPrice: billboard.rentalPrice,
                    installationCost: billboard.installationCost,
                    maintenance: billboard.maintenance,

                    width: billboard.width,
                    height: billboard.height,
                    lighting: billboard.lighting,
                    structureType: { connect: { id: billboard.structureTypeId } },
                    panelCondition: billboard.panelCondition,
                    decorativeElement: billboard.decorativeElement,
                    foundations: billboard.foundations,
                    electricity: billboard.electricity,
                    framework: billboard.framework,
                    note: billboard.note,

                    lessorSpaceType: billboard.lessorSpaceType,
                    lessorType: { connect: { id: billboard.lessorTypeId } },

                    lessorSupplier: {
                        connect: {
                            id: billboard.lessorSupplierId as string
                        }
                    },
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
        "id", "companyId", "reference", "hasTax", "type", "name", "locality", "zone", "area", "visualMarker",
        "displayBoard", "address", "city", "gmaps", "orientation",
        "rentalPrice", "installationCost", "maintenance", "width", "height", "lighting",
        "structureType", "panelCondition", "decorativeElement", "foundations", "electricity", "framework", "note", "lastPhotos", "lastPhotos", "lastBrochures"
    ];

    const lessorFields = [
        "lessorSpaceType", "lessorType", "lessorCustomer", "lessorName", "lessorAddress", "lessorCity", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "rib", "iban", "bicSwift", "bankName",
        "representativeFirstName", "representativeLastName", "representativeJob", "representativeEmail", "representativePhone", "rentalStartDate", "rentalPeriod", "paymentMode", "paymentFrequency", "electricitySupply", "specificCondition"
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
    lessorData.rentalStartDate = rawData["rentalStartDate"] ? new Date(rawData["rentalStartDate"]) : undefined;

    // Fichiers uploadés
    billboardData.photos = filesMap["photos"] ?? [];
    billboardData.brochures = filesMap["brochures"] ?? [];

    // Conversion des anciens fichiers en tableau
    const dataToValidate = {
        billboard: {
            ...(billboardData as EditBillboardSchemaType),
            hasTax: JSON.parse(billboardData.hasTax),
            width: Number(billboardData.width),
            height: Number(billboardData.height),
            lastPhotos: billboardData.lastPhotos ? billboardData.lastPhotos.split(";") : [],
            lastBrochures: billboardData.lastBrochures ? billboardData.lastBrochures.split(";") : [],
            rentalPrice: new Decimal(billboardData.rentalPrice),
            installationCost: new Decimal(billboardData.installationCost),
            maintenance: new Decimal(billboardData.maintenance),
        },
        lessor: {
            ...(lessorData as EditLessorSchemaType),
            capital: new Decimal(lessorData.capital || 0),
            paymentMode: lessorData.paymentMode ? JSON.parse(lessorData.paymentMode) : []
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

    // Sauvegarde fichiers
    let savedPathsPhoto: string[] = await updateFiles({ folder: folderPhoto, outdatedData: { id: billboard.id, path: billboard.pathPhoto, files: billboard.photos }, updatedData: { id: data.billboard.id, lastUploadDocuments: data.billboard.lastPhotos }, files: data.billboard.photos ?? [] });
    let savedPathsBrochure: string[] = await updateFiles({ folder: folderBrochure, outdatedData: { id: billboard.id, path: billboard.pathBrochure, files: billboard.brochures }, updatedData: { id: data.billboard.id, lastUploadDocuments: data.billboard.lastBrochures }, files: data.billboard.brochures ?? [] });

    try {
        const updatedBillboard = await prisma.billboard.update({
            where: {
                id: data.billboard.id
            },
            data: {
                reference: data.billboard.reference,
                hasTax: data.billboard.hasTax,
                type: {
                    connect: {
                        id: data.billboard.type
                    }
                },
                name: data.billboard.name,
                locality: data.billboard.locality,
                zone: data.billboard.zone,
                area: { connect: { id: data.billboard.area } },
                visualMarker: data.billboard.visualMarker,
                displayBoard: { connect: { id: data.billboard.displayBoard } },

                address: data.billboard.address,
                city: { connect: { id: data.billboard.city } },
                orientation: data.billboard.orientation,
                gmaps: data.billboard.gmaps,

                pathPhoto: folderPhoto,
                pathBrochure: folderBrochure,
                photos: savedPathsPhoto,
                brochures: savedPathsBrochure,

                rentalPrice: data.billboard.rentalPrice,
                installationCost: data.billboard.installationCost,
                maintenance: data.billboard.maintenance,

                width: data.billboard.width,
                height: data.billboard.height,
                lighting: data.billboard.lighting,
                structureType: { connect: { id: data.billboard.structureType } },
                panelCondition: data.billboard.panelCondition,
                decorativeElement: data.billboard.decorativeElement,
                foundations: data.billboard.foundations,
                electricity: data.billboard.electricity,
                framework: data.billboard.framework,
                note: data.billboard.note,

                lessorSpaceType: data.lessor.lessorSpaceType,
                lessorType: { connect: { id: data.lessor.lessorType } },
                ...(data.lessor.lessorSpaceType === "public" ? {
                    lessorSupplier: {
                        connect: {
                            id: data.lessor.lessorCustomer
                        }
                    },
                } : {
                    lessorName: data.lessor.lessorName,
                    lessorAddress: data.lessor.lessorAddress,
                    lessorCity: data.lessor.lessorCity,
                    lessorPhone: data.lessor.lessorPhone,
                    lessorEmail: data.lessor.lessorEmail,

                    capital: data.lessor.capital,
                    rccm: data.lessor.rccm,
                    taxIdentificationNumber: data.lessor.taxIdentificationNumber,
                    bankName: data.lessor.bankName,
                    rib: data.lessor.rib,
                    iban: data.lessor.iban,
                    bicSwift: data.lessor.bicSwift,

                    representativeFirstName: data.lessor.representativeFirstName,
                    representativeLastName: data.lessor.representativeLastName,
                    representativeJob: data.lessor.representativeJob,
                    representativePhone: data.lessor.representativePhone,
                    representativeEmail: data.lessor.representativeEmail,

                    rentalStartDate: data.lessor.rentalStartDate ?? null,
                    rentalPeriod: data.lessor.rentalPeriod,
                    paymentMode: JSON.stringify(data.lessor.paymentMode),
                    paymentFrequency: data.lessor.paymentFrequency,
                    electricitySupply: data.lessor.electricitySupply,
                    specificCondition: data.lessor.specificCondition,
                }),
                company: { connect: { id: data.billboard.companyId } },
            },
        });

        return NextResponse.json({
            status: "success",
            message: "Panneau modifié avec succès.",
            data: {
                ...updatedBillboard,
            },
        });

    } catch (error) {
        await removePath([...savedPathsPhoto, ...savedPathsBrochure,]);
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
    await removePath(billboard.photos)
    await removePath(billboard.brochures)
    return NextResponse.json({
        state: "success",
        message: "Panneau publicitaire supprimé avec succès.",
    }, { status: 200 }
    )
}