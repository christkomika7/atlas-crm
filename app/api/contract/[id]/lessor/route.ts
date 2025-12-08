import { checkAccess } from "@/lib/access";
import { getEndDate } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { ContractLessorType } from "@/types/contract-types";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { generateLessorContractDocument } from "@/lib/word";
import { RentalPeriodType } from "@/types/data.type";
import { MORAL_COMPANY } from "@/config/constant";

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
                    type: true,
                    lessorType: true,
                    lessorSupplier: true

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

    const legalForm = type === "supplier" ?
        contract.lessor?.legalForms :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            contract.billboard.legalForms :
            '';

    const capital = type === "supplier" ?
        formatNumber(contract.lessor?.capital || 0) :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            formatNumber(contract.billboard?.capital?.toString() || 0) :
            0;

    const rccm = type === "supplier" ?
        contract.lessor?.businessRegistrationNumber :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            contract.billboard?.rccm :
            '';

    const representativeName = type === "supplier" ?
        `${contract.lessor?.firstname} ${contract.lessor?.lastname}` :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            `${contract.billboard?.representativeFirstName} ${contract.billboard?.representativeLastName}` :
            contract.billboard?.lessorName;

    const representativeJob = type === "supplier" ?
        contract.lessor?.job :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            contract.billboard?.representativeJob :
            '';

    const email = type === "supplier" ?
        contract.lessor?.email :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            contract.billboard?.representativeEmail :
            contract.billboard?.lessorEmail;

    const phone = type === "supplier" ?
        contract.lessor?.phone :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            contract.billboard?.representativePhone :
            contract.billboard?.lessorPhone;

    const nif = type === "supplier" ?
        contract.lessor?.taxIdentificationNumber :
        type !== "supplier" && contract.billboard?.lessorType.name === MORAL_COMPANY ?
            contract.billboard?.taxIdentificationNumber :
            '';

    const startLocation = contract.billboard?.lessorType.name === MORAL_COMPANY ?
        new Date(contract.billboard?.rentalStartDate || new Date()) :
        new Date(contract.billboard?.delayContractStart || new Date());

    const endLocation = contract.billboard?.lessorType.name === MORAL_COMPANY ?
        getEndDate(contract.billboard?.rentalStartDate || new Date(), contract.billboard?.rentalPeriod as RentalPeriodType) :
        new Date(contract.billboard?.delayContractEnd || new Date());

    Object.assign(formatContract, {
        id: contract.id,
        type: contract.type,
        record: [],
        lessor: {
            id: `${type === 'supplier' ? contract.lessorId : contract.billboardId}`,
            company: `${type === 'supplier' ? contract.lessor?.companyName : contract.billboard?.lessorName}`,
            legalForm,
            capital,
            rccm,
            nif,
            address: `${type === 'supplier' ? contract.lessor?.address : contract.billboard?.lessorAddress}`,
            representativeName,
            representativeJob,
            email,
            phone,
            country: getCountryFrenchName(contract.company.country),
            startLocation,
            endLocation,
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