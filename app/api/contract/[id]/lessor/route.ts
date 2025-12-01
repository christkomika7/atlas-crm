import { checkAccess } from "@/lib/access";
import { getEndDate } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { ContractLessorType } from "@/types/contract-types";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
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

    if (!contract) {
        return NextResponse.json({
            state: "error",
            message: "Aucun contrat trouvé."
        }, { status: 400 })
    }

    const formatContract = {
        filename: `Contrat AG-LOC-${generateAmaId(contract.contractNumber, false)}`
    };


    const type = contract.lessorType;

    Object.assign(formatContract, {
        id: contract.id,
        type: contract.type,
        record: [],
        lessor: {
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
            country: getCountryFrenchName(contract.company.country),
            startLocation: type === "supplier" ? (new Date(contract.billboard?.delayContractStart || new Date())) : new Date(contract.billboard?.rentalStartDate || new Date()),
            endLocation: type === "supplier" ? (new Date(contract.billboard?.delayContractEnd || new Date())) : (getEndDate(contract.billboard?.rentalStartDate || new Date(), contract.billboard?.rentalPeriod as RentalPeriodType)),
            images: contract.billboard?.photos || [],
            gmaps: `${contract.billboard?.gmaps}`,
            locationPrice: `${formatNumber(contract.billboard?.locationPrice || 0)} ${contract.company.currency}`,
            nonlocationPrice: `${formatNumber(contract.billboard?.nonLocationPrice || 0)} ${contract.company.currency}`,

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
        createdAt: contract.createdAt,
    })

    const lessorContract = formatContract as ContractLessorType;

    const buffer = await generateLessorContractDocument(lessorContract);

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${lessorContract.filename}.docx"`,
        },
    });
}