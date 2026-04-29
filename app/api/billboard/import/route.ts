import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { BillboardImportType } from "@/types/billboard.types";
import { Decimal } from "decimal.js";
import { acceptPayment, generalNotes, lessorSpaceType, rentalDurations } from "@/lib/data";

const getValue = (value: any) =>
    value === undefined || value === null || value === "" ? undefined : value;

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

        const validBillboards = billboards.filter(b => getValue(b["Référence"]));

        const existingRefs = await prisma.billboard.findMany({
            where: { companyId },
            select: { reference: true }
        });
        const existingRefSet = new Set(existingRefs.map(b => b.reference));

        const toCreate = validBillboards.filter(b => {
            const ref = getValue(b["Référence"])!;
            if (existingRefSet.has(ref)) return false;
            existingRefSet.add(ref);
            return true;
        });

        const skipped = validBillboards
            .filter(b => !toCreate.includes(b))
            .map(b => getValue(b["Référence"])!);

        if (toCreate.length === 0) {
            return NextResponse.json({
                state: "success",
                message: `Import terminé : 0 créé(s), ${skipped.length} ignoré(s).`,
                skipped,
            }, { status: 200 });
        }

        const uniqueTypes = [...new Set(toCreate.map(b => getValue(b["Type de panneau publicitaire"])).filter(Boolean))];
        const uniqueCities = [...new Set(toCreate.map(b => getValue(b["Ville (Panneau)"])).filter(Boolean))];
        const uniqueLessorCities = [...new Set(toCreate.map(b => getValue(b["Ville (Bailleur)"])).filter(v => v && v !== "NC"))];
        const allCities = [...new Set([...uniqueCities, ...uniqueLessorCities])];
        const uniqueDisplayBoards = [...new Set(toCreate.map(b => getValue(b["Support d'affichage"])).filter(Boolean))];
        const uniqueStructures = [...new Set(toCreate.map(b => getValue(b["Type de structure"])).filter(Boolean))];

        const [
            existingTypes,
            existingCities,
            existingDisplayBoards,
            existingStructures,
            existingAreas,
            existingLessorTypes,
        ] = await Promise.all([
            prisma.billboardType.findMany({ where: { companyId }, select: { id: true, name: true } }),
            prisma.city.findMany({ where: { companyId }, select: { id: true, name: true } }),
            prisma.displayBoard.findMany({ where: { companyId }, select: { id: true, name: true } }),
            prisma.structureType.findMany({ where: { companyId }, select: { id: true, name: true } }),
            prisma.area.findMany({ where: { companyId }, select: { id: true, name: true, cityId: true } }),
            prisma.lessorType.findMany({ where: { companyId }, select: { id: true, name: true, type: true } }),
        ]);

        const typeMap = new Map(existingTypes.map(t => [t.name, t.id]));
        const cityMap = new Map(existingCities.map(c => [c.name, c.id]));
        const displayBoardMap = new Map(existingDisplayBoards.map(d => [d.name, d.id]));
        const structureMap = new Map(existingStructures.map(s => [s.name, s.id]));
        const areaMap = new Map(existingAreas.map(a => [`${a.name}__${a.cityId}`, a.id]));
        const lessorTypeMap = new Map(existingLessorTypes.map(l => [`${l.name}__${l.type}`, l.id]));

        for (const name of uniqueTypes) {
            if (!typeMap.has(name)) {
                const record = await prisma.billboardType.create({ data: { name, companyId } });
                typeMap.set(name, record.id);
            }
        }

        for (const name of allCities) {
            if (!cityMap.has(name)) {
                const record = await prisma.city.create({ data: { name, companyId } });
                cityMap.set(name, record.id);
            }
        }

        for (const name of uniqueDisplayBoards) {
            if (!displayBoardMap.has(name)) {
                const record = await prisma.displayBoard.create({ data: { name, companyId } });
                displayBoardMap.set(name, record.id);
            }
        }

        for (const name of uniqueStructures) {
            if (!structureMap.has(name)) {
                const record = await prisma.structureType.create({ data: { name, companyId } });
                structureMap.set(name, record.id);
            }
        }

        for (const b of toCreate) {
            const cityName = getValue(b["Ville (Panneau)"]);
            const areaName = getValue(b["Quartier"]);
            if (!cityName || !areaName) continue;
            const cityId = cityMap.get(cityName)!;
            const areaKey = `${areaName}__${cityId}`;
            if (!areaMap.has(areaKey)) {
                const record = await prisma.area.create({ data: { name: areaName, cityId, companyId } });
                areaMap.set(areaKey, record.id);
            }
        }

        for (const b of toCreate) {
            const spaceTypeRaw = b["Type d'espace"];
            const spaceType = (lessorSpaceType.find(t => t.label === spaceTypeRaw)?.value ?? "public") as "private" | "public";
            const lessorTypeLabel = getValue(b["Type de bailleur"]);
            if (!lessorTypeLabel) continue;
            const dbType = spaceType === "private" ? "PRIVATE" : "PUBLIC";
            const key = `${lessorTypeLabel}__${dbType}`;
            if (!lessorTypeMap.has(key)) {
                const record = await prisma.lessorType.create({ data: { name: lessorTypeLabel, type: dbType, companyId } });
                lessorTypeMap.set(key, record.id);
            }
        }

        const created: string[] = [];

        await prisma.$transaction(
            async (tx) => {
                for (const billboard of toCreate) {
                    const reference = getValue(billboard["Référence"])!;
                    const hasTax = billboard["Article taxable"] ?? false;
                    const name = getValue(billboard["Nom du panneau publicitaire"]);
                    const locality = getValue(billboard["Lieu"]);
                    const cityName = getValue(billboard["Ville (Panneau)"]);
                    const areaName = getValue(billboard["Quartier"]);
                    const visualMarker = getValue(billboard["Repère visuel"]);
                    const displayBoardName = getValue(billboard["Support d'affichage"]);
                    const orientation = getValue(billboard["Orientation"]);
                    const gmaps = getValue(billboard["Lien Google Maps"]);
                    const typeName = getValue(billboard["Type de panneau publicitaire"]);

                    const rentalPrice = getDecimal(billboard["Prix de location"]);
                    const installationCost = getDecimal(billboard["Coût d'installation"]);
                    const maintenance = getDecimal(billboard["Coût d'entretien"]);

                    const width = billboard["Largeur"] ? Number(billboard["Largeur"]) : 0;
                    const height = billboard["Hauteur"] ? Number(billboard["Hauteur"]) : 0;
                    const lighting = getValue(billboard["Éclairage"]);
                    const structureName = getValue(billboard["Type de structure"]);
                    const panelCondition = getValue(billboard["État du panneau"]);
                    const decorativeElement = getValue(billboard["Éléments décoratifs"]);
                    const foundations = getValue(billboard["Fondations et visserie"]);
                    const electricity = getValue(billboard["Électricité et éclairage"]);
                    const framework = getValue(billboard["Structure et châssis"]);
                    const note = generalNotes.find(n => n.label === billboard["Aspect général"])?.value ?? "one";

                    const spaceTypeRaw = billboard["Type d'espace"];
                    const spaceType = (lessorSpaceType.find(t => t.label === spaceTypeRaw)?.value ?? "public") as "private" | "public";
                    const lessorTypeLabel = getValue(billboard["Type de bailleur"]);
                    const isPrivate = spaceType === "private";

                    const lessorCityName = getValue(billboard["Ville (Bailleur)"]);
                    const paymentModeRaw = getValue(billboard["Mode de paiement"]);
                    const paymentMode = paymentModeRaw && paymentModeRaw !== "NC"
                        ? acceptPayment.find(p => p.label === paymentModeRaw)?.value
                        : undefined;

                    const rentalStartDateRaw = getValue(billboard["Date début location"]);
                    const rentalStartDate = rentalStartDateRaw && rentalStartDateRaw !== "NC"
                        ? new Date(rentalStartDateRaw)
                        : undefined;

                    const cityId = cityMap.get(cityName!)!;
                    const areaId = areaMap.get(`${areaName}__${cityId}`)!;
                    const typeId = typeMap.get(typeName!)!;
                    const displayBoardId = displayBoardMap.get(displayBoardName!)!;
                    const structureTypeId = structureName ? structureMap.get(structureName) : undefined;
                    const lessorTypeId = lessorTypeMap.get(`${lessorTypeLabel}__${isPrivate ? "PRIVATE" : "PUBLIC"}`)!;
                    const lessorCityId = lessorCityName && lessorCityName !== "NC" ? cityMap.get(lessorCityName) : undefined;

                    created.push(reference);

                    await tx.billboard.create({
                        data: {
                            reference,
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
                            width,
                            height,
                            lighting,
                            panelCondition,
                            decorativeElement,
                            foundations,
                            electricity,
                            framework,
                            note,
                            lessorSpaceType: spaceType,
                            type: { connect: { id: typeId } },
                            area: { connect: { id: areaId } },
                            displayBoard: { connect: { id: displayBoardId } },
                            city: { connect: { id: cityId } },
                            company: { connect: { id: companyId } },
                            lessorType: { connect: { id: lessorTypeId } },
                            ...(structureTypeId ? { structureType: { connect: { id: structureTypeId } } } : {}),
                            lessorName: isPrivate ? getValue(billboard["Nom du bailleur"]) : undefined,
                            lessorAddress: isPrivate ? getValue(billboard["Adresse complète du bailleur"]) : undefined,
                            lessorCity: lessorCityId ? lessorCityName : lessorCityName,
                            lessorPhone: isPrivate ? getValue(billboard["Téléphone"]) : undefined,
                            lessorEmail: isPrivate ? getValue(billboard["Email"]) : undefined,
                            bankName: isPrivate ? getValue(billboard["Nom de la banque"]) : undefined,
                            rib: isPrivate ? getValue(billboard["RIB"]) : undefined,
                            iban: isPrivate ? getValue(billboard["IBAN"]) : undefined,
                            bicSwift: isPrivate ? getValue(billboard["BIC/SWIFT"]) : undefined,
                            rentalStartDate: isPrivate ? rentalStartDate : undefined,
                            rentalPeriod: isPrivate ? rentalDurations.find(d => d.label === billboard["Durée du contrat"])?.value : undefined,
                            locationPrice: isPrivate ? getValue(billboard["Prix du panneau loué"]) : undefined,
                            nonLocationPrice: isPrivate ? getValue(billboard["Prix du panneau non loué"]) : undefined,
                            paymentMode: isPrivate && paymentMode ? JSON.stringify([paymentMode]) : undefined,
                            paymentFrequency: isPrivate ? getValue(billboard["Fréquence de paiement"]) : undefined,
                            electricitySupply: isPrivate ? getValue(billboard["Fourniture du courant"]) : undefined,
                            specificCondition: isPrivate ? getValue(billboard["Conditions particulières"]) : undefined,
                        }
                    });
                }
            },
            { timeout: 30000 }
        );

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