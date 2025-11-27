import { INVOICE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { durationInMonths, formatDateToDashModel, getMonthsAndDaysDifference } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { ContractItemType, ContractType } from "@/types/contract-types";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";
import { generateClientContractDocument } from "@/lib/word";

export async function GET(req: NextRequest) {
    const result = await checkAccess("CONTRACT", "CREATE");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }


    const id = getIdFromUrl(req.url, 2) as string;

    const contract = await prisma.contract.findUnique({
        where: { id, type: "CLIENT" },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            },
            client: true,
            invoices: {
                include: {
                    items: {
                        include: {
                            billboard: {
                                include: {
                                    type: true
                                }
                            }
                        }
                    }
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

    const updatedItems: ContractItemType[] = [];

    for (const invoice of contract.invoices) {
        const items = invoice.items;
        for (const item of items) {
            const price = new Decimal(item.price.toString())
                .mul(Math.ceil(durationInMonths(item.locationStart, item.locationEnd)));

            const discountType = item.discountType;
            const discount = new Decimal(item.discount || 0);

            let delayPrice = price;

            if (discount.gt(0)) {
                if (discountType === "money") {
                    delayPrice = price.minus(discount);
                } else if (discountType === "percent") {
                    const discountValue = price.mul(discount).div(100);
                    delayPrice = price.minus(discountValue);
                }
            }

            const billboard: ContractItemType = {
                id: invoice.id as string,
                reference: item.billboard?.reference as string,
                model: item.billboard?.type.name as string,
                dim: `${item.billboard?.width || 0}m x ${item.billboard?.height || 0}m`,
                area: `${(item.billboard?.width || 0) * (item.billboard?.height || 0)}m²`,
                site: item.billboard?.locality as string,
                lighting: item.billboard?.lighting === "Non éclairé" ? 'Non' : 'Oui',
                location: `${formatDateToDashModel(item.locationStart)} au ${formatDateToDashModel(item.locationEnd)}`,
                delay: getMonthsAndDaysDifference(item.locationStart, item.locationEnd),
                price: formatNumber(item.price.toString()),
                delayPrice: formatNumber(delayPrice)
            }
            updatedItems.push(billboard);
        }
    }

    Object.assign(formatContract, {
        id: contract.id,
        type: contract.type,
        totalHT: formatNumber(contract.invoices.reduce((total, n) => new Decimal(total).add(n.totalHT.toString()), new Decimal(0))),
        totalTTC: formatNumber(contract.invoices.reduce((total, n) => new Decimal(total).add(n.totalTTC.toString()), new Decimal(0))),
        record: contract.invoices.map(invoice => `${contract.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)}`),
        client: {
            id: contract.clientId as string,
            company: contract.client?.companyName as string,
            legalForm: contract.client?.legalForms as string,
            capital: formatNumber(contract.client?.capital || 0),
            rccm: contract.client?.businessRegistrationNumber as string,
            nif: contract.client?.taxIdentificationNumber as string,
            address: contract.client?.address as string,
            representativeName: `${contract.client?.firstname} ${contract.client?.lastname}`,
            representativeJob: contract.client?.job,
            email: contract.client?.email as string,
            phone: contract.client?.phone as string,
        },
        company: {
            name: contract.company.companyName,
            legalForm: contract.company.legalForms,
            capital: formatNumber(contract.company.capitalAmount),
            address: contract.company.registeredAddress,
            rccm: contract.company.businessRegistrationNumber,
            niu: contract.company.niu,
            representativeName: 'M. Ralph PINTO',
            representativeJob: 'Co-Gérant',
            email: contract.company.email,
            phone: contract.company.phoneNumber,
            currency: contract.company.currency,
            city: contract.company.city,
            country: getCountryFrenchName(contract.company.country)
        },
        items: updatedItems,
        createdAt: contract.createdAt,
    });

    const clientContract = formatContract as ContractType;

    const buffer = await generateClientContractDocument(clientContract);

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${clientContract.filename}.docx"`,
        },
    });
}