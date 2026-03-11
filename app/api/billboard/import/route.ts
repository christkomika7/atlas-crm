import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { BillboardImportType } from "@/types/billboard.types";
import { Decimal } from "decimal.js";
import { acceptPayment, generalNotes, lessorSpaceType, rentalDurations } from "@/lib/data";


export async function POST(req: NextRequest) {
    const result = await checkAccess(["BILLBOARDS"], "CREATE");

    if (!result.authorized) {
        return Response.json({ state: "error", message: result.message }, { status: 403 });
    }

    try {
        const { data, companyId } = await req.json();

        if (!data || !companyId) {
            return NextResponse.json({ state: "error", message: "Données manquante." }, { status: 400 });
        }

        const billboards = data as BillboardImportType[];

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { documentModel: true }
        });

        console.log({ billboards });

        if (!company) {
            return NextResponse.json({ state: "error", message: "Entreprise introuvable." }, { status: 404 });
        }

        let earlyReturnResponse: { status: string; message: string } | null = null;

        await prisma.$transaction(async (tx) => {
            for (const billboard of billboards) {
                let typeId: string = "";
                let cityId: string = "";
                let areaId: string = "";
                let displayBoardId: string = "";
                let structureTypeId: string = ""
                let lessorCityId: string = "";
                let lessorTypeId: string = "";

                const reference = billboard.Référence;
                const hasTax = billboard["Article taxable"];
                const type = billboard["Type de panneau publicitaire"];
                const name = billboard["Nom du panneau publicitaire"];
                const locality = billboard.Lieu;
                const city = billboard["Ville (Bailleur)"];
                const area = billboard.Quartier;
                const visualMarker = billboard["Repère visuel"];
                const displayBoard = billboard["Support d'affichage"];
                const orientation = billboard.Orientation;
                const gmaps = billboard["Lien Google Maps"];

                const rentalPrice = new Decimal(billboard["Prix de location"]);
                const installationCost = new Decimal(billboard["Coût d'installation"]);
                const maintenance = new Decimal(billboard["Coût d'entretien"]);

                const width = billboard.Largeur;
                const height = billboard.Hauteur;
                const lighting = billboard.Éclairage;
                const structureType = billboard["Type de structure"];
                const panelCondition = billboard["État du panneau"];
                const decorativeElement = billboard["Éléments décoratifs"];
                const foundations = billboard["Fondations et visserie"];
                const electricity = billboard["Électricité et éclairage"];
                const framework = billboard["Structure et châssis"]
                const note = generalNotes.find((note) => note.label === billboard["Aspect général"])?.value || "one";

                const lessorSpaceTypeValue = (lessorSpaceType.find((type) => type.label === billboard["Type d'espace"])?.value || "public") as "private" | "public";
                const lessorType = billboard["Type d'espace"];
                if (lessorSpaceTypeValue === "public") {
                    return NextResponse.json({ state: "error", message: "Le type d'espace public n'est pas autorisé." }, { status: 404 });
                }

                // Il manque 1 ici

                const lessorName = billboard["Nom du bailleur"];
                const lessorAddress = billboard["Adresse complète du bailleur"];
                const lessorCity = billboard["Ville (Bailleur)"];
                const lessorPhone = billboard.Téléphone;
                const lessorEmail = billboard.Email;

                const bankName = billboard["Nom de la banque"];
                const rib = billboard.RIB;
                const iban = billboard.IBAN;
                const bicSwift = billboard["BIC/SWIFT"];

                const rentalStartDate = billboard["Date début location"];
                const rentalPeriod = rentalDurations.find((duration) => duration.label === billboard["Durée du contrat"])?.value || "5_years";
                const locationPrice = billboard["Prix du panneau loué"];
                const nonLocationPrice = billboard["Prix du panneau non loué"];
                const paymentMode = acceptPayment.find((payment) => payment.label === billboard["Mode de paiement"])?.value || "cash";
                const paymentFrequency = billboard["Fréquence de paiement"];
                const electricitySupply = billboard["Fourniture du courant"];
                const specialConditions = billboard["Conditions particulières"];

                const { typeExist, cityExist, displayBoardExist, structureTypeExist, lessorCityExist, lessorTypeExist } = await prisma.$transaction(async (tx) => {
                    const typeExist = await tx.billboardType.findFirst({
                        where: {
                            name: type,
                            companyId
                        }
                    });

                    const cityExist = await tx.city.findFirst({
                        where: {
                            name: city,
                            companyId
                        }
                    });

                    const lessorCityExist = await tx.city.findFirst({
                        where: {
                            name: lessorCity,
                            companyId
                        }
                    });

                    const displayBoardExist = await tx.displayBoard.findFirst({
                        where: {
                            name: displayBoard,
                            companyId
                        }
                    });

                    const structureTypeExist = await tx.structureType.findFirst({
                        where: {
                            name: structureType,
                            companyId
                        }
                    });

                    const lessorTypeExist = await tx.lessorType.findFirst({
                        where: {
                            name: lessorType,
                            type: lessorSpaceTypeValue === "private" ? "PRIVATE" : "PUBLIC",
                            companyId
                        }
                    });

                    return { typeExist, cityExist, displayBoardExist, structureTypeExist, lessorCityExist, lessorTypeExist }
                });

                if (!typeExist) {
                    typeId = (await tx.billboardType.create({
                        data: {
                            name: type,
                            companyId
                        }
                    })).id;
                } else {
                    typeId = typeExist.id;
                }

                if (!cityExist) {
                    cityId = (await tx.city.create({
                        data: {
                            name: city,
                            companyId
                        }
                    })).id;
                } else {
                    cityId = cityExist.id;
                }

                if (!lessorCityExist) {
                    lessorCityId = (await tx.city.create({
                        data: {
                            name: lessorCity,
                            companyId
                        }
                    })).id;
                } else {
                    lessorCityId = lessorCityExist.id;
                }

                const areaExist = await tx.area.findFirst({
                    where: {
                        name: area,
                        cityId,
                        companyId
                    }
                });

                if (!areaExist) {
                    areaId = (await tx.area.create({
                        data: {
                            name: area,
                            cityId,
                            companyId
                        }
                    })).id;
                } else {
                    areaId = areaExist.id;
                }

                if (!displayBoardExist) {
                    displayBoardId = (await tx.displayBoard.create({
                        data: {
                            name: displayBoard,
                            companyId
                        }
                    })).id;
                } else {
                    displayBoardId = displayBoardExist.id;
                }

                if (!structureTypeExist) {
                    structureTypeId = (await tx.structureType.create({
                        data: {
                            name: structureType,
                            companyId
                        }
                    })).id;
                } else {
                    structureTypeId = structureTypeExist.id;
                }

                if (!lessorTypeExist) {
                    lessorTypeId = (await tx.lessorType.create({
                        data: {
                            name: lessorType,
                            type: lessorSpaceTypeValue === "private" ? "PRIVATE" : "PUBLIC",
                            companyId
                        }
                    })).id;
                } else {
                    lessorTypeId = lessorTypeExist.id;
                }


            }

        });

        if (earlyReturnResponse) {
            return NextResponse.json(earlyReturnResponse);
        }

        return NextResponse.json({ state: "success", message: "Import Excel effectué avec succès." }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur import Excel:", error);
        return NextResponse.json(
            { state: "error", message: error.message || "Erreur lors de l'import Excel." },
            { status: 500 }
        );
    }
}