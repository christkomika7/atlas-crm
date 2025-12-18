import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { getFirstValidCompanyId } from "@/lib/utils";
import { Decimal } from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

const getValue = (value: any) =>
    value === undefined || value === null || value === "" ? undefined : value;

export async function POST(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "CREATE");

    if (!result.authorized) {
        return NextResponse.json(
            { state: "error", message: result.message },
            { status: 403 }
        );
    }

    const formData = await req.formData();
    const filesMap: Record<string, File[]> = {};
    const rawData: Record<string, any> = {};

    formData.forEach((value, key) => {
        if (value instanceof File) {
            if (!filesMap[key]) filesMap[key] = [];
            filesMap[key].push(value);
        } else {
            rawData[key] = rawData[key] !== undefined
                ? Array.isArray(rawData[key])
                    ? [...rawData[key], value]
                    : [rawData[key], value]
                : value;
        }
    });

    const billboardData = {
        companyId: getValue(rawData.companyId),
        reference: getValue(rawData.reference),
        hasTax: rawData.hasTax ? JSON.parse(rawData.hasTax) : false,
        type: getValue(rawData.type),
        name: getValue(rawData.name),
        locality: getValue(rawData.locality),
        area: getValue(rawData.area),
        visualMarker: getValue(rawData.visualMarker),
        displayBoard: getValue(rawData.displayBoard),
        city: getValue(rawData.city),
        orientation: getValue(rawData.orientation),
        gmaps: getValue(rawData.gmaps),
        rentalPrice: rawData.rentalPrice ? new Decimal(rawData.rentalPrice) : undefined,
        installationCost: rawData.installationCost ? new Decimal(rawData.installationCost) : new Decimal(0),
        maintenance: rawData.maintenance ? new Decimal(rawData.maintenance) : new Decimal(0),
        width: rawData.width ? Number(rawData.width) : undefined,
        height: rawData.height ? Number(rawData.height) : undefined,
        lighting: getValue(rawData.lighting),
        structureType: getValue(rawData.structureType),
        panelCondition: getValue(rawData.panelCondition),
        decorativeElement: getValue(rawData.decorativeElement),
        foundations: getValue(rawData.foundations),
        electricity: getValue(rawData.electricity),
        framework: getValue(rawData.framework),
        note: getValue(rawData.note),
        photos: filesMap["photos"] ?? [],
        brochures: filesMap["brochures"] ?? [],
    };

    if (rawData.lighting) {
        Object.assign(billboardData, {

        })
    }

    const lessorData: any = {
        lessorType: getValue(rawData.lessorType),
        lessorSpaceType: getValue(rawData.lessorSpaceType),
    };

    if (lessorData.lessorSpaceType === "private") {
        lessorData.lessorName = getValue(rawData.lessorName);
        lessorData.lessorAddress = getValue(rawData.lessorAddress);
        lessorData.lessorCity = getValue(rawData.lessorCity);
        lessorData.lessorPhone = getValue(rawData.lessorPhone);
        lessorData.lessorEmail = getValue(rawData.lessorEmail);
        lessorData.bankName = getValue(rawData.bankName);
        lessorData.rib = getValue(rawData.rib);
        lessorData.iban = getValue(rawData.iban);
        lessorData.bicSwift = getValue(rawData.bicSwift);

        lessorData.identityCard = getValue(rawData.identityCard);
        lessorData.delayContractStart = rawData.delayContractStart ? new Date(rawData.delayContractStart) : undefined;
        lessorData.delayContractEnd = rawData.delayContractEnd ? new Date(rawData.delayContractEnd) : undefined;


        lessorData.capital = rawData.capital ? new Decimal(rawData.capital) : undefined;
        lessorData.rccm = getValue(rawData.rccm);
        lessorData.taxIdentificationNumber = getValue(rawData.taxIdentificationNumber);
        lessorData.niu = getValue(rawData.niu);
        lessorData.legalForms = getValue(rawData.legalForms);

        lessorData.representativeFirstName = getValue(rawData.representativeFirstName);
        lessorData.representativeLastName = getValue(rawData.representativeLastName);
        lessorData.representativeJob = getValue(rawData.representativeJob);
        lessorData.representativeEmail = getValue(rawData.representativeEmail);
        lessorData.representativePhone = getValue(rawData.representativePhone);

        lessorData.rentalStartDate = rawData.rentalStartDate ? new Date(rawData.rentalStartDate) : undefined;
        lessorData.rentalPeriod = getValue(rawData.rentalPeriod);
        lessorData.paymentMode = rawData.paymentMode ? JSON.parse(rawData.paymentMode) : [];
        lessorData.paymentFrequency = getValue(rawData.paymentFrequency);
        lessorData.electricitySupply = getValue(rawData.electricitySupply);
        lessorData.specificCondition = getValue(rawData.specificCondition);

        lessorData.locationPrice = getValue(rawData.locationPrice);
        lessorData.nonLocationPrice = getValue(rawData.nonLocationPrice);
    } else {
        lessorData.lessorCustomer = getValue(rawData.lessorCustomer);
    }

    const key = crypto.randomUUID();
    const folderPhoto = createFolder(["billboard", "photo", `${billboardData.name}_----${key}`]);
    const folderBrochure = createFolder(["billboard", "brochure", `${billboardData.name}_----${key}`]);

    let savedPathsPhoto: string[] = [];
    let savedPathsBrochure: string[] = [];

    try {
        for (const file of billboardData.photos) savedPathsPhoto.push(await createFile(file, folderPhoto));
        for (const file of billboardData.brochures) savedPathsBrochure.push(await createFile(file, folderBrochure));

        const createData: any = {
            reference: billboardData.reference,
            hasTax: billboardData.hasTax,
            type: { connect: { id: billboardData.type } },
            name: billboardData.name,
            locality: billboardData.locality,
            area: { connect: { id: billboardData.area } },
            visualMarker: billboardData.visualMarker,
            displayBoard: { connect: { id: billboardData.displayBoard } },
            city: { connect: { id: billboardData.city } },
            orientation: billboardData.orientation,
            gmaps: billboardData.gmaps,
            pathPhoto: folderPhoto,
            pathBrochure: folderBrochure,
            photos: savedPathsPhoto,
            brochures: savedPathsBrochure,
            rentalPrice: billboardData.rentalPrice,
            installationCost: billboardData.installationCost,
            maintenance: billboardData.maintenance,
            width: billboardData.width,
            height: billboardData.height,
            lighting: billboardData.lighting,
            ...(billboardData.structureType ? { structureType: { connect: { id: billboardData.structureType } } } : {}),
            panelCondition: billboardData.panelCondition,
            decorativeElement: billboardData.decorativeElement,
            foundations: billboardData.foundations,
            electricity: billboardData.electricity,
            framework: billboardData.framework,
            note: billboardData.note,
            company: { connect: { id: billboardData.companyId } },
            lessorSpaceType: lessorData.lessorSpaceType,
            lessorType: { connect: { id: lessorData.lessorType } },
        };

        if (lessorData.lessorSpaceType === "private") {
            Object.assign(createData, {
                lessorName: lessorData.lessorName,
                lessorAddress: lessorData.lessorAddress,
                lessorCity: lessorData.lessorCity,
                lessorPhone: lessorData.lessorPhone,
                lessorEmail: lessorData.lessorEmail,
                bankName: lessorData.bankName,
                rib: lessorData.rib,
                iban: lessorData.iban,
                bicSwift: lessorData.bicSwift,
                identityCard: lessorData.identityCard,
                capital: lessorData.capital,
                rccm: lessorData.rccm,
                taxIdentificationNumber: lessorData.taxIdentificationNumber,
                niu: lessorData.niu,
                legalForms: lessorData.legalForms,
                representativeFirstName: lessorData.representativeFirstName,
                representativeLastName: lessorData.representativeLastName,
                representativeJob: lessorData.representativeJob,
                representativeEmail: lessorData.representativeEmail,
                representativePhone: lessorData.representativePhone,
                delayContractStart: lessorData.delayContractStart,
                delayContractEnd: lessorData.delayContractEnd,
                rentalStartDate: lessorData.rentalStartDate,
                rentalPeriod: lessorData.rentalPeriod,
                paymentMode: lessorData.paymentMode.length > 0 ? JSON.stringify(lessorData.paymentMode) : undefined,
                paymentFrequency: lessorData.paymentFrequency,
                electricitySupply: lessorData.electricitySupply,
                specificCondition: lessorData.specificCondition,
                locationPrice: lessorData.locationPrice,
                nonLocationPrice: lessorData.nonLocationPrice,
            });
        } else {
            if (lessorData.lessorCustomer) createData.lessorSupplier = { connect: { id: lessorData.lessorCustomer } };
        }

        const createdBillboard = await prisma.billboard.create({ data: createData });

        return NextResponse.json({
            status: "success",
            message: "Panneau ajouté avec succès.",
            data: createdBillboard,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du panneau:", error);
        await removePath([...savedPathsPhoto, ...savedPathsBrochure]);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de l'ajout du panneau." },
            { status: 500 }
        );
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