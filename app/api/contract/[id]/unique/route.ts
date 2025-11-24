import { INVOICE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { durationInMonths, formatDateToDashModel, getEndDate, getMonthsAndDaysDifference } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { ContractItemType } from "@/types/contract-types";
import { RentalPeriodType } from "@/types/data.type";
import Decimal from "decimal.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["CONTRACT"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;

    const contract = await prisma.contract.findUnique({
        where: { id },
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

    const formatContract = {};

    if (contract.type === "CLIENT") {
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
        })
    }

    if (contract.type === "LESSOR") {
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
                delayPrice: formatNumber(price.mul(Math.ceil(durationInMonths(startDate, endDate))))
            }],
            createdAt: contract.createdAt,
        })
    }

    return NextResponse.json({
        state: "success",
        data: formatContract,
    }, { status: 200 })
}