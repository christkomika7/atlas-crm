import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { BillboardImportType } from "@/types/billboard.types";
import { Decimal } from "decimal.js";
import { acceptPayment, generalNotes, lessorSpaceType, rentalDurations } from "@/lib/data";

const getValue = (value: any) =>
    value === undefined || value === null || value === ""
        ? undefined
        : value;

const getDecimal = (value: string | undefined) => {
    const v = getValue(value);
    if (!v || v === "NC") return new Decimal(0);
    return new Decimal(v);
};

export async function POST(req: NextRequest) {
    const result = await checkAccess(["BILLBOARDS"], "CREATE");

    if (!result.authorized) {
        return Response.json({ state: "error", message: result.message }, { status: 403 });
    }

    try {
        const { data, companyId } = await req.json();

        if (!data || !companyId) {
            return NextResponse.json({ state: "error", message: "Données manquantes." }, { status: 400 });
        }

        const billboards = data as BillboardImportType[];

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { documentModel: true }
        });

        if (!company) {
            return NextResponse.json({ state: "error", message: "Entreprise introuvable." }, { status: 404 });
        }

        const created: string[] = [];
        const skipped: string[] = [];

        await prisma.$transaction(async (tx) => {
            const existingRefs = await tx.billboard.findMany({
                where: { companyId },
                select: { reference: true }
            });
            const existingRefSet = new Set(existingRefs.map(b => b.reference));

            for (const billboard of billboards) {
                const reference = getValue(billboard["Référence"]);

                if (!reference) continue;

                if (existingRefSet.has(reference)) {
                    skipped.push(reference);
                    continue;
                }

                const hasTax = billboard["Article taxable"] ?? false;
                const type = getValue(billboard["Type de panneau publicitaire"]);
                const name = getValue(billboard["Nom du panneau publicitaire"]);
                const locality = getValue(billboard["Lieu"]);
                const city = getValue(billboard["Ville (Panneau)"]);
                const area = getValue(billboard["Quartier"]);
                const visualMarker = getValue(billboard["Repère visuel"]);
                const displayBoard = getValue(billboard["Support d'affichage"]);
                const orientation = getValue(billboard["Orientation"]);
                const gmaps = getValue(billboard["Lien Google Maps"]);

                const rentalPrice = getDecimal(billboard["Prix de location"]);
                const installationCost = getDecimal(billboard["Coût d'installation"]);
                const maintenance = getDecimal(billboard["Coût d'entretien"]);

                const width = billboard["Largeur"] ? Number(billboard["Largeur"]) : undefined;
                const height = billboard["Hauteur"] ? Number(billboard["Hauteur"]) : undefined;
                const lighting = getValue(billboard["Éclairage"]);
                const structureType = getValue(billboard["Type de structure"]);
                const panelCondition = getValue(billboard["État du panneau"]);
                const decorativeElement = getValue(billboard["Éléments décoratifs"]);
                const foundations = getValue(billboard["Fondations et visserie"]);
                const electricity = getValue(billboard["Électricité et éclairage"]);
                const framework = getValue(billboard["Structure et châssis"]);
                const note = generalNotes.find((n) => n.label === billboard["Aspect général"])?.value ?? "one";

                const lessorSpaceTypeRaw = billboard["Type d'espace"];
                const lessorSpaceTypeValue = (lessorSpaceType.find((t) => t.label === lessorSpaceTypeRaw)?.value ?? "public") as "private" | "public";
                const lessorTypeLabel = getValue(billboard["Type de bailleur"]);

                const lessorName = getValue(billboard["Nom du bailleur"]);
                const lessorAddress = getValue(billboard["Adresse complète du bailleur"]);
                const lessorCity = getValue(billboard["Ville (Bailleur)"]);
                const lessorPhone = getValue(billboard["Téléphone"]);
                const lessorEmail = getValue(billboard["Email"]);
                const bankName = getValue(billboard["Nom de la banque"]);
                const rib = getValue(billboard["RIB"]);
                const iban = getValue(billboard["IBAN"]);
                const bicSwift = getValue(billboard["BIC/SWIFT"]);
                const rentalStartDateRaw = getValue(billboard["Date début location"]);
                const rentalStartDate = rentalStartDateRaw && rentalStartDateRaw !== "NC"
                    ? new Date(rentalStartDateRaw)
                    : undefined;
                const rentalPeriod = rentalDurations.find((d) => d.label === billboard["Durée du contrat"])?.value ?? undefined;
                const locationPrice = getValue(billboard["Prix du panneau loué"]);
                const nonLocationPrice = getValue(billboard["Prix du panneau non loué"]);
                const paymentModeRaw = getValue(billboard["Mode de paiement"]);
                const paymentMode = paymentModeRaw && paymentModeRaw !== "NC"
                    ? acceptPayment.find((p) => p.label === paymentModeRaw)?.value
                    : undefined;
                const paymentFrequency = getValue(billboard["Fréquence de paiement"]);
                const electricitySupply = getValue(billboard["Fourniture du courant"]);
                const specificCondition = getValue(billboard["Conditions particulières"]);

                let typeRecord = await tx.billboardType.findFirst({ where: { name: type, companyId } });
                if (!typeRecord) typeRecord = await tx.billboardType.create({ data: { name: type, companyId } });

                let cityRecord = await tx.city.findFirst({ where: { name: city, companyId } });
                if (!cityRecord) cityRecord = await tx.city.create({ data: { name: city, companyId } });

                let areaRecord = await tx.area.findFirst({ where: { name: area, cityId: cityRecord.id, companyId } });
                if (!areaRecord) areaRecord = await tx.area.create({ data: { name: area, cityId: cityRecord.id, companyId } });

                let displayBoardRecord = await tx.displayBoard.findFirst({ where: { name: displayBoard, companyId } });
                if (!displayBoardRecord) displayBoardRecord = await tx.displayBoard.create({ data: { name: displayBoard, companyId } });

                let structureTypeRecord: { id: string } | null = null;
                if (structureType) {
                    structureTypeRecord = await tx.structureType.findFirst({ where: { name: structureType, companyId } });
                    if (!structureTypeRecord) structureTypeRecord = await tx.structureType.create({ data: { name: structureType, companyId } });
                }

                let lessorCityRecord: { id: string; name: string } | null = null;
                if (lessorCity && lessorCity !== "NC") {
                    lessorCityRecord = await tx.city.findFirst({ where: { name: lessorCity, companyId } });
                    if (!lessorCityRecord) lessorCityRecord = await tx.city.create({ data: { name: lessorCity, companyId } });
                }

                let lessorTypeRecord = await tx.lessorType.findFirst({
                    where: {
                        name: lessorTypeLabel,
                        type: lessorSpaceTypeValue === "private" ? "PRIVATE" : "PUBLIC",
                        companyId
                    }
                });
                if (!lessorTypeRecord) {
                    lessorTypeRecord = await tx.lessorType.create({
                        data: {
                            name: lessorTypeLabel,
                            type: lessorSpaceTypeValue === "private" ? "PRIVATE" : "PUBLIC",
                            companyId
                        }
                    });
                }

                await tx.billboard.create({
                    data: {
                        reference: reference ?? "",
                        hasTax,
                        name: name ?? "",
                        locality: locality ?? "",
                        visualMarker: visualMarker ?? "",
                        orientation: orientation ?? "",
                        gmaps: gmaps ?? "",
                        pathPhoto: "",
                        pathBrochure: "",
                        photos: [],
                        brochures: [],
                        rentalPrice,
                        installationCost,
                        maintenance,
                        width: width ?? 0,
                        height: height ?? 0,
                        lighting,
                        panelCondition,
                        decorativeElement,
                        foundations,
                        electricity,
                        framework,
                        note,
                        lessorSpaceType: lessorSpaceTypeValue,

                        type: { connect: { id: typeRecord.id } },
                        area: { connect: { id: areaRecord.id } },
                        displayBoard: { connect: { id: displayBoardRecord.id } },
                        city: { connect: { id: cityRecord.id } },
                        company: { connect: { id: companyId } },
                        lessorType: { connect: { id: lessorTypeRecord.id } },
                        ...(structureTypeRecord ? { structureType: { connect: { id: structureTypeRecord.id } } } : {}),

                        lessorName: lessorSpaceTypeValue === "private" ? lessorName : undefined,
                        lessorAddress: lessorSpaceTypeValue === "private" ? lessorAddress : undefined,
                        lessorCity: lessorCityRecord?.name ?? lessorCity,
                        lessorPhone: lessorSpaceTypeValue === "private" ? lessorPhone : undefined,
                        lessorEmail: lessorSpaceTypeValue === "private" ? lessorEmail : undefined,
                        bankName: lessorSpaceTypeValue === "private" ? bankName : undefined,
                        rib: lessorSpaceTypeValue === "private" ? rib : undefined,
                        iban: lessorSpaceTypeValue === "private" ? iban : undefined,
                        bicSwift: lessorSpaceTypeValue === "private" ? bicSwift : undefined,
                        rentalStartDate: lessorSpaceTypeValue === "private" ? rentalStartDate : undefined,
                        rentalPeriod: lessorSpaceTypeValue === "private" ? rentalPeriod : undefined,
                        locationPrice: lessorSpaceTypeValue === "private" ? locationPrice : undefined,
                        nonLocationPrice: lessorSpaceTypeValue === "private" ? nonLocationPrice : undefined,
                        paymentMode: lessorSpaceTypeValue === "private" && paymentMode ? JSON.stringify([paymentMode]) : undefined,
                        paymentFrequency: lessorSpaceTypeValue === "private" ? paymentFrequency : undefined,
                        electricitySupply: lessorSpaceTypeValue === "private" ? electricitySupply : undefined,
                        specificCondition: lessorSpaceTypeValue === "private" ? specificCondition : undefined,
                    }
                });

                existingRefSet.add(reference);
                created.push(reference);
            }
        });

        return NextResponse.json({
            state: "success",
            message: `Import terminé : ${created.length} créé(s), ${skipped.length} ignoré(s).`,
            skipped,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur import Excel:", error);
        return NextResponse.json(
            { state: "error", message: error.message || "Erreur lors de l'import Excel." },
            { status: 500 }
        );
    }
}