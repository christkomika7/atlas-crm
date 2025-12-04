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
    const result = await checkAccess("BILLBOARDS", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

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
        "companyId", "reference", "hasTax", "type", "name", "locality", "area", "visualMarker",
        "displayBoard", "city", "gmaps", "orientation",
        "rentalPrice", "installationCost", "maintenance", "width", "height", "lighting",
        "structureType", "panelCondition", "decorativeElement", "foundations", "electricity", "framework", "note"
    ];

    const lessorFields = [
        "lessorSpaceType", "lessorType", "lessorCustomer", "lessorName", "lessorAddress", "lessorCity", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "rib", "iban", "bicSwift", "bankName",
        "representativeFirstName", "representativeLastName", "representativeJob", "representativeEmail", "representativePhone", "rentalStartDate", "rentalPeriod", "paymentMode", "paymentFrequency", "electricitySupply", "specificCondition",
        "niu", "legalForms", "locationPrice", "nonLocationPrice", "delayContract", "identityCard"
    ];

    const rentalStartDate = rawData["rentalStartDate"];
    const delayContract = rawData["delayContract"];

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
    lessorData.delayContract = delayContract ? JSON.parse(lessorData.delayContract) : undefined;

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
            delayContract: lessorData.delayContract?.from && lessorData.delayContract?.to ? {
                from: new Date(lessorData.delayContract.from),
                to: new Date(lessorData.delayContract.to)
            } : undefined,
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

    const key = generateId();
    const folderPhoto = createFolder([companyExist.companyName, "billboard", "photo", `${data.billboard.name}_----${key}`]);
    const folderBrochure = createFolder([companyExist.companyName, "billboard", "brochure", `${data.billboard.name}_----${key}`]);

    let savedPathsPhoto: string[] = [];
    let savedPathsBrochure: string[] = [];

    // Fonction helper pour filtrer les valeurs vides
    const isEmptyValue = (value: any): boolean => {
        return value === undefined ||
            value === null ||
            value === 'undefined' ||
            value === 'null' ||
            value === '';
    };

    // Fonction pour obtenir une valeur ou undefined si vide
    const getValueOrUndefined = <T>(value: T): T | undefined => {
        return isEmptyValue(value) ? undefined : value;
    };

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
                    type: { connect: { id: data.billboard.type } },
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
                    locationPrice: getValueOrUndefined(data.lessor.locationPrice),
                    nonLocationPrice: getValueOrUndefined(data.lessor.nonLocationPrice),
                    lessorName: getValueOrUndefined(data.lessor.lessorName),
                    lessorAddress: getValueOrUndefined(data.lessor.lessorAddress),
                    lessorCity: getValueOrUndefined(data.lessor.lessorCity),
                    lessorPhone: getValueOrUndefined(data.lessor.lessorPhone),
                    lessorEmail: getValueOrUndefined(data.lessor.lessorEmail),
                    identityCard: getValueOrUndefined(data.lessor.identityCard),
                    capital: getValueOrUndefined(data.lessor.capital),
                    rccm: getValueOrUndefined(data.lessor.rccm),
                    taxIdentificationNumber: getValueOrUndefined(data.lessor.taxIdentificationNumber),
                    legalForms: getValueOrUndefined(data.lessor.legalForms),
                    niu: getValueOrUndefined(data.lessor.niu),
                    bankName: getValueOrUndefined(data.lessor.bankName),
                    rib: getValueOrUndefined(data.lessor.rib),
                    iban: getValueOrUndefined(data.lessor.iban),
                    bicSwift: getValueOrUndefined(data.lessor.bicSwift),
                    representativeFirstName: getValueOrUndefined(data.lessor.representativeFirstName),
                    representativeLastName: getValueOrUndefined(data.lessor.representativeLastName),
                    representativeJob: getValueOrUndefined(data.lessor.representativeJob),
                    representativePhone: getValueOrUndefined(data.lessor.representativePhone),
                    representativeEmail: getValueOrUndefined(data.lessor.representativeEmail),
                    delayContractStart: getValueOrUndefined(data.lessor.delayContract?.from),
                    delayContractEnd: getValueOrUndefined(data.lessor.delayContract?.to),
                    rentalStartDate: getValueOrUndefined(data.lessor.rentalStartDate),
                    rentalPeriod: getValueOrUndefined(data.lessor.rentalPeriod),
                    paymentMode: data.lessor.paymentMode ? JSON.stringify(data.lessor.paymentMode) : undefined,
                    paymentFrequency: getValueOrUndefined(data.lessor.paymentFrequency),
                    electricitySupply: getValueOrUndefined(data.lessor.electricitySupply),
                    specificCondition: getValueOrUndefined(data.lessor.specificCondition),
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

        } else {
            const createdBillboard = await prisma.billboard.create({
                data: {
                    reference: data.billboard.reference,
                    hasTax: data.billboard.hasTax,
                    type: { connect: { id: data.billboard.type } },
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
                    lessorType: { connect: { id: data.lessor.lessorType } },
                    lessorSpaceType: data.lessor.lessorSpaceType,
                    ...(data.lessor.lessorCustomer && !isEmptyValue(data.lessor.lessorCustomer) && {
                        lessorSupplier: { connect: { id: data.lessor.lessorCustomer as string } }
                    }),
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
    const result = await checkAccess("BILLBOARDS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

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

    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.BILLBOARDS, ids, companyId)

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
    }

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