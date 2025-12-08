import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { copyTo, createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { editBillboardFormSchema, EditBillboardSchemaFormType, EditBillboardSchemaType, EditLessorSchemaType } from "@/lib/zod/billboard.schema";
import { BillboardType } from "@/types/billboard.types";
import { Decimal } from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    try {
        const id = getIdFromUrl(req.url, "last") as string;

        const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
        const lessor = req.nextUrl.searchParams.get("lessor") ?? "";
        const lessorType = req.nextUrl.searchParams.get("lessorType") ?? "";

        //pagination
        const MAX_TAKE = 200;
        const DEFAULT_TAKE = 50;

        const rawSkip = req.nextUrl.searchParams.get("skip");
        const rawTake = req.nextUrl.searchParams.get("take");

        const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

        let take = DEFAULT_TAKE;
        if (rawTake) {
            const parsed = parseInt(rawTake, 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                take = Math.min(parsed, MAX_TAKE);
            }
        }

        // Build where clause
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
                    OR: searchTerms.map((term: string) => ({
                        information: {
                            contains: term,
                            mode: "insensitive",
                        },
                    })),
                },
            ];
        }

        if (lessor && lessorType) {
            if (lessorType === "lessor") {
                baseWhere.id = lessor;
            } else {
                const supplier = await prisma.supplier.findUnique({
                    where: { id: lessor },
                    include: { billboards: { select: { id: true } } },
                });

                const billboardIds = supplier?.billboards.map(b => b.id).filter(Boolean) || [];

                baseWhere.id = billboardIds.length
                    ? { in: billboardIds }
                    : { in: ["__NONE__"] };
            }
        }

        // total count
        const total = await prisma.billboard.count({
            where: baseWhere,
        });

        // fetch paginated results
        const billboards = await prisma.billboard.findMany({
            where: baseWhere,
            include: {
                company: true,
                type: true,
                items: { where: { state: "APPROVED" } },
                lessorSupplier: true,
                lessorType: true
            },
            skip,
            take,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(
            {
                status: "success",
                data: billboards,
                total,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erreur GET /api/billboard:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des panneaux publicitaires." },
            { status: 500 }
        );
    }
}


export async function POST(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "CREATE");

    if (!result.authorized) {
        return NextResponse.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

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
        }, { status: 400 });
    }

    // Nouveau key et nouveaux dossiers
    const key = generateId();

    const folderPhoto = createFolder([
        "billboard",
        "photo",
        `${billboard.name}_----${key}`
    ]);

    const folderBrochure = createFolder([
        "billboard",
        "brochure",
        `${billboard.name}_----${key}`
    ]);

    let savedPathsPhoto: string[] = [];
    let savedPathsBrochure: string[] = [];

    try {
        // Copier toutes les images existantes
        savedPathsPhoto = await copyTo(billboard.photos ?? [], folderPhoto);
        savedPathsBrochure = await copyTo(billboard.brochures ?? [], folderBrochure);

        const baseData: any = {
            reference: key,
            hasTax: billboard.hasTax,
            type: { connect: { id: billboard.typeId } },
            name: billboard.name,
            locality: billboard.locality,
            area: { connect: { id: billboard.areaId } },
            visualMarker: billboard.visualMarker,
            displayBoard: { connect: { id: billboard.displayBoardId } },

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

            company: { connect: { id: billboard.companyId } },
        };

        // Cas des privés
        if (billboard.lessorSpaceType === "private") {
            Object.assign(baseData, {
                locationPrice: billboard.locationPrice,
                nonLocationPrice: billboard.nonLocationPrice,

                lessorName: billboard.lessorName,
                lessorAddress: billboard.lessorAddress,
                lessorCity: billboard.lessorCity,
                lessorPhone: billboard.lessorPhone,
                lessorEmail: billboard.lessorEmail,

                capital: billboard.capital,
                rccm: billboard.rccm,
                taxIdentificationNumber: billboard.taxIdentificationNumber,
                niu: billboard.niu,
                legalForms: billboard.legalForms,
                bankName: billboard.bankName,
                rib: billboard.rib,
                iban: billboard.iban,
                bicSwift: billboard.bicSwift,

                representativeFirstName: billboard.representativeFirstName,
                representativeLastName: billboard.representativeLastName,
                representativeJob: billboard.representativeJob,
                representativePhone: billboard.representativePhone,
                representativeEmail: billboard.representativeEmail,

                identityCard: billboard.identityCard,
                delayContractStart: billboard.delayContractStart,
                delayContractEnd: billboard.delayContractEnd,
                rentalStartDate: billboard.rentalStartDate,
                rentalPeriod: billboard.rentalPeriod,
                paymentMode: billboard.paymentMode,
                paymentFrequency: billboard.paymentFrequency,
                electricitySupply: billboard.electricitySupply,
                specificCondition: billboard.specificCondition,
            });
        } else {
            // Cas des lessors corporate
            if (billboard.lessorSupplierId) {
                baseData.lessorSupplier = {
                    connect: { id: billboard.lessorSupplierId }
                };
            }
        }

        await prisma.billboard.create({ data: baseData });

        return NextResponse.json({
            status: "success",
            message: "Panneau dupliqué avec succès.",
        });

    } catch (error) {
        console.error("Erreur de duplication:", error);

        await removePath([
            ...savedPathsPhoto,
            ...savedPathsBrochure,
        ]);

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la duplication du panneau.",
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

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
        "id", "companyId", "reference", "hasTax", "type", "name", "locality", "area", "visualMarker",
        "displayBoard", "city", "gmaps", "orientation",
        "rentalPrice", "installationCost", "maintenance", "width", "height", "lighting",
        "structureType", "panelCondition", "decorativeElement", "foundations", "electricity", "framework", "note", "lastPhotos", "lastPhotos", "lastBrochures"
    ];

    const lessorFields = [
        "lessorSpaceType", "lessorType", "lessorCustomer", "lessorName", "lessorAddress", "lessorCity", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "rib", "iban", "bicSwift", "bankName",
        "representativeFirstName", "representativeLastName", "representativeJob", "representativeEmail", "representativePhone", "rentalStartDate", "rentalPeriod", "paymentMode", "paymentFrequency", "electricitySupply", "specificCondition",
        'niu', "legalForms", "locationPrice", "nonLocationPrice", "delayContractStart", "delayContractEnd", "identityCard", "lessorTypeName"
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

    if (rawData["rentalStartDate"]) {
        lessorData.rentalStartDate = rawData["rentalStartDate"]
    }
    if (rawData["delayContractStart"]) {
        lessorData.delayContractStart = rawData["delayContractStart"]
    }

    if (rawData["delayContractEnd"]) {
        lessorData.delayContractEnd = rawData["delayContractEnd"]
    }


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
        }
    };

    if (lessorData.rentalStartDate) {
        Object.assign(dataToValidate.lessor, {
            rentalStartDate: lessorData.rentalStartDate
        })
    }

    if (lessorData.delayContractStart) {
        Object.assign(dataToValidate.lessor, {
            delayContractStart: lessorData.delayContractStart
        })
    }

    if (lessorData.delayContractEnd) {
        Object.assign(dataToValidate.lessor, {
            delayContractEnd: lessorData.delayContractEnd
        })
    }
    if (lessorData.capital) {
        Object.assign(dataToValidate.lessor, {
            capital: lessorData.capital
        })
    }

    if (lessorData.paymentMode) {
        Object.assign(dataToValidate.lessor, {
            paymentMode: JSON.parse(lessorData.paymentMode)
        })
    }


    const data = parseData<EditBillboardSchemaFormType>(
        editBillboardFormSchema,
        dataToValidate as EditBillboardSchemaFormType
    ) as EditBillboardSchemaFormType;

    const [companyExist, refExist, billboardExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.billboard.companyId } }),
        prisma.billboard.findFirst({ where: { reference: data.billboard.reference, companyId: data.billboard.companyId } }),
        prisma.billboard.findUnique({ where: { id: data.billboard.id } })
    ]);

    if (!companyExist) {
        return NextResponse.json({ status: "error", message: "Société introuvable." }, { status: 404 });
    }

    if (!billboardExist) {
        return NextResponse.json({ status: "error", message: "Panneau introuvable." }, { status: 404 });
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
                area: { connect: { id: data.billboard.area } },
                visualMarker: data.billboard.visualMarker,
                displayBoard: { connect: { id: data.billboard.displayBoard } },

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

                ...(data.lessor.lessorSpaceType === "public" ?
                    {
                        lessorSupplier: {
                            connect: {
                                id: data.lessor.lessorCustomer as string
                            }
                        },
                        lessorName: null,
                        lessorAddress: null,
                        lessorCity: null,
                        lessorPhone: null,
                        lessorEmail: null,
                        delayContractEnd: null,
                        delayContractStart: null,
                        locationPrice: null,
                        nonLocationPrice: null,
                        identityCard: null,

                        capital: null,
                        rccm: null,
                        taxIdentificationNumber: null,
                        niu: null,
                        legalForms: undefined,
                        bankName: null,
                        rib: null,
                        iban: null,
                        bicSwift: null,

                        representativeFirstName: null,
                        representativeLastName: null,
                        representativeJob: null,
                        representativePhone: null,
                        representativeEmail: null,

                        rentalStartDate: null,
                        rentalPeriod: null,
                        paymentMode: null,
                        paymentFrequency: null,
                        electricitySupply: null,
                        specificCondition: null,
                    } : {
                        lessorSupplier: {
                            disconnect: {
                                id: billboardExist.lessorTypeId as string
                            }
                        },
                        locationPrice: data.lessor.locationPrice || null,
                        nonLocationPrice: data.lessor.nonLocationPrice || null,
                        delayContractStart: data.lessor.delayContractStart ? new Date(data.lessor.delayContractStart) : null,
                        delayContractEnd: data.lessor.delayContractEnd ? new Date(data.lessor.delayContractEnd) : null,

                        lessorName: data.lessor.lessorName || null,
                        lessorAddress: data.lessor.lessorAddress || null,
                        lessorCity: data.lessor.lessorCity || null,
                        lessorPhone: data.lessor.lessorPhone || null,
                        lessorEmail: data.lessor.lessorEmail || null,

                        capital: data.lessor.capital ? new Decimal(data.lessor.capital) : null,
                        rccm: data.lessor.rccm || null,
                        taxIdentificationNumber: data.lessor.taxIdentificationNumber || null,
                        niu: data.lessor.niu || null,
                        legalForms: data.lessor.legalForms || undefined,
                        bankName: data.lessor.bankName || null,
                        rib: data.lessor.rib || null,
                        iban: data.lessor.iban || null,
                        bicSwift: data.lessor.bicSwift || null,

                        representativeFirstName: data.lessor.representativeFirstName || null,
                        representativeLastName: data.lessor.representativeLastName || null,
                        representativeJob: data.lessor.representativeJob || null,
                        representativePhone: data.lessor.representativePhone || null,
                        representativeEmail: data.lessor.representativeEmail || null,

                        rentalStartDate: data.lessor.rentalStartDate ? new Date(data.lessor.rentalStartDate) : null,
                        rentalPeriod: data.lessor.rentalPeriod || null,
                        paymentMode: data.lessor.paymentMode ? JSON.stringify(data.lessor.paymentMode) : null,
                        paymentFrequency: data.lessor.paymentFrequency || null,
                        electricitySupply: data.lessor.electricitySupply || null,
                        specificCondition: data.lessor.specificCondition || null,
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
        console.log({ error });
        await removePath([...savedPathsPhoto, ...savedPathsBrochure,]);
        return NextResponse.json({ status: "error", message: "Erreur lors de la modification." }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    const billboard = await prisma.billboard.findUnique({
        where: { id },
        include: { company: true }
    });

    if (!billboard) {
        return NextResponse.json({
            message: "Rendez-vous introuvable.",
            state: "error",
        }, { status: 400 })
    }

    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.BILLBOARDS, [id], billboard.company.id);

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
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