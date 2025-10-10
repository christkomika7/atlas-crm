import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils";
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
        "companyId", "reference", "type", "name", "dimension", "city", "area", "placement",
        "orientation", "information", "address", "gmaps", "zone",
        "rentalPrice", "installationCost", "maintenance", "structure", "decorativeElement",
        "foundations", "technicalVisibility", "note",
    ];

    const lessorFields = [
        "lessorType", "lessorName", "lessorJob", "lessorEmail", "lessorPhone", "capital", "rccm", "taxIdentificationNumber", "lessorAddress",
        "representativeName", "representativeContract", "leasedSpace", "paymentMethod", "specificCondition", "lessorCustomer", "lessorSpaceType"
    ];

    const contractFrom = rawData["contractFrom"];
    const contractTo = rawData["contractTo"];

    const billboardData: Record<string, any> = {};
    const lessorData: Record<string, any> = {};

    for (const key in rawData) {
        if (billboardFields.includes(key)) {
            billboardData[key] = rawData[key];
        } else if (lessorFields.includes(key)) {
            lessorData[key] = rawData[key];
        }
    }

    lessorData.contractDuration = contractFrom && contractTo ? {
        from: new Date(contractFrom),
        to: new Date(contractTo),
    } : undefined;


    billboardData.imageFiles = filesMap["imageFiles"] ?? [];
    billboardData.brochureFiles = filesMap["brochureFiles"] ?? [];

    lessorData.signedLeaseContract = filesMap["signedLeaseContract"] ?? [];
    lessorData.files = filesMap["files"] ?? [];

    const dataToValidate = {
        billboard: {
            ...billboardData,
            rentalPrice: new Decimal(billboardData.rentalPrice),
            installationCost: new Decimal(billboardData.installationCost),
            maintenance: new Decimal(billboardData.maintenance),
        },
        lessor: {
            ...lessorData,
            capital: new Decimal(lessorData.capital || 0)
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
    const folderContract = createFolder([companyExist.companyName, "billboard", "contract", `${data.billboard.name}_----${key}`]);
    const folderOther = createFolder([companyExist.companyName, "billboard", "other", `${data.billboard.name}_----${key}`]);



    let savedPathsPhoto: string[] = [];
    let savedPathsBrochure: string[] = [];
    let savedPathsContract: string[] = [];
    let savedPathsOther: string[] = [];

    try {
        // Sauvegarde des photos
        for (const file of billboardData.imageFiles) {
            const upload = await createFile(file, folderPhoto);
            savedPathsPhoto.push(upload);
        }

        // Sauvegarde des brochures
        for (const file of billboardData.brochureFiles) {
            const upload = await createFile(file, folderBrochure);
            savedPathsBrochure.push(upload);
        }

        // Sauvegarde des contrats signés
        for (const file of lessorData.signedLeaseContract) {
            const upload = await createFile(file, folderContract);
            savedPathsContract.push(upload);
        }

        // Sauvegarde des autres fichiers
        for (const file of lessorData.files) {
            const upload = await createFile(file, folderOther);
            savedPathsOther.push(upload);
        }

        if (data.lessor.lessorSpaceType === "private") {
            const createdBillboard = await prisma.billboard.create({
                data: {
                    reference: data.billboard.reference,
                    pathBrochure: folderBrochure,
                    pathContract: folderContract,
                    pathFile: folderOther,
                    pathPhoto: folderPhoto,
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
                message: "Panneau ajouté avec succès.",
                data: {
                    ...createdBillboard,
                    contractDuration: [createdBillboard?.contractStart, createdBillboard?.contractEnd],
                },
            });

        }
        else {
            const createdBillboard = await prisma.billboard.create({
                data: {
                    reference: data.billboard.reference,
                    pathBrochure: folderBrochure,
                    pathContract: folderContract,
                    pathFile: folderOther,
                    pathPhoto: folderPhoto,
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
                    contractDuration: [createdBillboard?.contractStart, createdBillboard?.contractEnd],
                },
            });
        }

    } catch (error) {
        await removePath([
            ...savedPathsPhoto,
            ...savedPathsBrochure,
            ...savedPathsContract,
            ...savedPathsOther
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
        where: { id: { in: ids } }
    })

    await prisma.billboard.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    billboards.map(async billboard => {
        await removePath(billboard.imageFiles)
        await removePath(billboard.brochureFiles)
        await removePath(billboard.signedLeaseContract)
        await removePath(billboard.files)
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les panneaux sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}