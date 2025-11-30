import { checkAccess } from "@/lib/access";
import { durationInMonths, formatDateToDashModel, getEndDate, getMonthsAndDaysDifference } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { ContractItemType, ContractType } from "@/types/contract-types";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";
import { generateLessorContractDocument } from "@/lib/word";
import { RentalPeriodType } from "@/types/data.type";

export async function GET(req: NextRequest) {
    const result = await checkAccess("CONTRACT", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, 2) as string;

    const contract = await prisma.contract.findUnique({
        where: {
            id, type: "LESSOR"
        },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            },
            billboard: {
                include: {
                    type: true
                }
            },
            lessor: true
        }
    });

    console.log({ contract })

    if (!contract) {
        return NextResponse.json({
            state: "error",
            message: "Aucun contrat trouvé."
        }, { status: 400 })
    }

    const formatContract = {
        filename: `Contrat AG-LOC-${generateAmaId(contract.contractNumber, false)}`
    };

    const updatedItems: ContractItemType[] = [];

    const startDate = contract.billboard?.rentalStartDate || new Date();
    const endDate = getEndDate(contract.billboard?.rentalStartDate || new Date(), contract.billboard?.rentalPeriod as RentalPeriodType);
    const price = new Decimal(contract.billboard?.rentalPrice.toString() || 0);
    const vat = contract.company.vatRates;

    const type = contract.lessorType;

    Object.assign(formatContract, {
        id: contract.id,
        type: contract.type,
        totalHT: formatNumber(price),
        totalTTC: formatNumber(price),
        record: [],
        client: {
            id: `${type === 'supplier' ? contract.lessorId : contract.billboardId}`,
            company: `${type === 'supplier' ? contract.lessor?.companyName : contract.billboard?.lessorName}`,
            legalForm: `${type === 'supplier' ? contract.lessor?.legalForms : contract.billboard?.legalForms}`,
            capital: type === 'supplier' ? formatNumber(contract.lessor?.capital || 0) : formatNumber(contract.billboard?.capital?.toString() || 0),
            rccm: `${type === 'supplier' ? contract.lessor?.businessRegistrationNumber : contract.billboard?.rccm}`,
            nif: `${type === 'supplier' ? contract.lessor?.taxIdentificationNumber : contract.billboard?.taxIdentificationNumber}`,
            address: `${type === 'supplier' ? contract.lessor?.address : contract.billboard?.lessorAddress}`,
            representativeName: type === 'supplier' ? `${contract.lessor?.firstname} ${contract.lessor?.lastname}` : `${contract.billboard?.representativeFirstName} ${contract.billboard?.representativeLastName}`,
            representativeJob: `${type === 'supplier' ? contract.lessor?.job : contract.billboard?.representativeJob}`,
            email: `${type === 'supplier' ? contract.lessor?.email : contract.billboard?.representativeEmail}`,
            phone: `${type === 'supplier' ? contract.lessor?.phone : contract.billboard?.representativePhone}`,

        },
        company: {
            name: contract.company.companyName,
            legalForm: contract.company.legalForms,
            capital: formatNumber(contract.company.capitalAmount),
            address: contract.company.registeredAddress,
            rccm: contract.company.businessRegistrationNumber,
            niu: contract.company.niu as string,
            representativeName: 'M. Ralph PINTO',
            representativeJob: 'Co-Gérant',
            currency: contract.company.currency,
            city: contract.company.city,
            email: contract.company.email,
            phone: contract.company.phoneNumber,
            country: getCountryFrenchName(contract.company.country)
        },
        items: [{
            id: contract.billboardId as string,
            reference: contract.billboard?.reference as string,
            model: contract.billboard?.type.name as string,
            dim: `${contract.billboard?.width}m x ${contract.billboard?.height}m`,
            area: `${(contract.billboard?.width || 0) * (contract.billboard?.height || 0)}m²`,
            site: contract.billboard?.locality as string,
            lighting: contract.billboard?.lighting === "Non éclairé" ? 'Non' : 'Oui',
            location: `${formatDateToDashModel(startDate)} au ${formatDateToDashModel(endDate)}`,
            delay: getMonthsAndDaysDifference(startDate, endDate),
            price: formatNumber(price),
            delayPrice: formatNumber(price.mul(Math.ceil(durationInMonths(startDate, endDate)))),
            images: contract.billboard?.photos
        }],
        createdAt: contract.createdAt,
    })

    const lessorContract = formatContract as ContractType;

    console.log("LESSOR CONTRACT");

    const buffer = await generateLessorContractDocument(lessorContract);

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${lessorContract.filename}.docx"`,
        },
    });
}