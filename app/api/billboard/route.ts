import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { generateId, getFirstValidCompanyId } from "@/lib/utils";
import { billboardFormSchema, BillboardSchemaFormType } from "@/lib/zod/billboard.schema";
import { Decimal } from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    // Vérification d'accès
    await checkAccess(["BILLBOARDS"], "CREATE");

    const formData = await req.formData();

    const filesMap: Record<string, File[]> = {};
    const rawData: Record<string, any> = {};

    // Organisation des données et fichiers
    formData.forEach((value, key) => {
        if (value instanceof File) {
            if (!filesMap[key]) filesMap[key] = [];
            filesMap[key].push(value);
        } else {
            if (rawData[key] !== undefined) {
                if (Array.isArray(rawData[key])) {
                    rawData[key].push(value);
                } else {
                    rawData[key] = [rawData[key], value];
                }
            } else {
                rawData[key] = value;
            }
        }
    });

    const billboardFields = [
        "companyId", "reference", "hasTax", "type", "name", "locality", "zone", "area", "visualMarker",
        "displayBoard", "address", "city", "gmaps", "orientation",
        "rentalPrice", "installationCost", "maintenance", "width", "height", "lighting",
        "structureType", "panelCondition", "decorativeElement", "foundations", "electricity", "framework", "note"
    ];

    const lessorFields = [
        "lessorSpaceType", "lessorType", "lessorCustomer", "lessorName", "lessorAddress", "lessorCity", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "rib", "iban", "bicSwift", "bankName",
        "representativeFirstName", "representativeLastName", "representativeJob", "representativeEmail", "representativePhone", "rentalStartDate", "rentalPeriod", "paymentMode", "paymentFrequency", "electricitySupply", "specificCondition",
        "niu", "legalForms"
    ];

    const rentalStartDate = rawData["rentalStartDate"];

    const billboardData: Record<string, any> = {};
    const lessorData: Record<string, any> = {};

    for (const key in rawData) {
        if (billboardFields.includes(key)) {
            billboardData[key] = rawData[key];
        } else if (lessorFields.includes(key)) {
            lessorData[key] = rawData[key];
        }
    }

    lessorData.rentalStartDate = rentalStartDate ? new Date(rentalStartDate) : undefined;

    billboardData.photos = filesMap["photos"] ?? [];
    billboardData.brochures = filesMap["brochures"] ?? [];

    const dataToValidate = {
        billboard: {
            ...billboardData,
            width: Number(billboardData.width),
            height: Number(billboardData.height),
            hasTax: JSON.parse(billboardData.hasTax),
            rentalPrice: new Decimal(billboardData.rentalPrice),
            installationCost: new Decimal(billboardData.installationCost),
            maintenance: new Decimal(billboardData.maintenance),
        },
        lessor: {
            ...lessorData,
            capital: new Decimal(lessorData.capital || 0),
            paymentMode: lessorData.paymentMode ? JSON.parse(lessorData.paymentMode) : []

        },
    };

    const data = parseData<BillboardSchemaFormType>(
        billboardFormSchema,
        dataToValidate as BillboardSchemaFormType
    ) as BillboardSchemaFormType;

    const [companyExist, billboardReferenceExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.billboard.companyId } }),
        prisma.billboard.findUnique({ where: { reference: data.billboard.reference } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    if (billboardReferenceExist) {
        return NextResponse.json({
            status: "error",
            message: "La référence du panneau est déjà utilisée.",
        }, { status: 404 });
    }

    console.log("HI")

    const key = generateId();
    const folderPhoto = createFolder([companyExist.companyName, "billboard", "photo", `${data.billboard.name}_----${key}`]);
    const folderBrochure = createFolder([companyExist.companyName, "billboard", "brochure", `${data.billboard.name}_----${key}`]);

    let savedPathsPhoto: string[] = [];
    let savedPathsBrochure: string[] = [];


    try {
        // Sauvegarde des photos
        for (const file of billboardData.photos) {
            const upload = await createFile(file, folderPhoto);
            savedPathsPhoto.push(upload);
        }

        // Sauvegarde des brochures
        for (const file of billboardData.brochures) {
            const upload = await createFile(file, folderBrochure);
            savedPathsBrochure.push(upload);
        }

        if (data.lessor.lessorSpaceType === "private") {
            const createdBillboard = await prisma.billboard.create({
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

                    lessorName: data.lessor.lessorName,
                    lessorAddress: data.lessor.lessorAddress,
                    lessorCity: data.lessor.lessorCity,
                    lessorPhone: data.lessor.lessorPhone,
                    lessorEmail: data.lessor.lessorEmail,

                    capital: data.lessor.capital,
                    rccm: data.lessor.rccm,
                    taxIdentificationNumber: data.lessor.taxIdentificationNumber,
                    legalForms: data.lessor.legalForms,
                    niu: data.lessor.niu,
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
                    company: { connect: { id: data.billboard.companyId } },
                },
            });
            return NextResponse.json({
                status: "success",
                message: "Panneau ajouté avec succès.",
                data: {
                    ...createdBillboard,
                },
            });

        }
        else {
            const createdBillboard = await prisma.billboard.create({
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

                    lessorType: { connect: { id: data.lessor.lessorType } },
                    lessorSpaceType: data.lessor.lessorSpaceType,
                    lessorSupplier: {
                        connect: {
                            id: data.lessor.lessorCustomer as string
                        }
                    },
                    company: { connect: { id: data.billboard.companyId } },
                },
            });

            return NextResponse.json({
                status: "success",
                message: "Panneau ajouté avec succès.",
                data: {
                    ...createdBillboard,
                },
            });
        }

    } catch (error) {
        console.log({ error })
        await removePath([
            ...savedPathsPhoto,
            ...savedPathsBrochure,
        ]);

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout du panneau.",
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "MODIFY");
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const billboards = await prisma.billboard.findMany({
        where: { id: { in: ids } },
        include: { company: true }
    })

    const companyId = getFirstValidCompanyId(billboards);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    await checkAccessDeletion($Enums.DeletionType.BILLBOARDS, ids, companyId)

    await prisma.billboard.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    billboards.map(async billboard => {
        await removePath(billboard.photos)
        await removePath(billboard.brochures)
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les panneaux sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}