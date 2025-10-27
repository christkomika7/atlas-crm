import { INVOICE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { copyTo, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["INVOICES"], "CREATE");
    const id = getIdFromUrl(req.url, 2) as string;

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            client: true,
            productsServices: true,
            billboards: true,
            items: true,
            project: true,
            company: {
                include: {
                    documentModel: true
                }
            }
        }
    });

    if (!invoice) return NextResponse.json({
        state: "error",
        message: "Aucune facture trouvée."
    }, { status: 400 })

    const lastInvoice = await prisma.invoice.findFirst({
        where: { companyId: invoice.companyId },
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true },
    });

    const key = generateId();
    const invoiceNumber = `${invoice.company.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${lastInvoice?.invoiceNumber || 1}`;
    const folderFile = createFolder([invoice.company.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);
    let savedPaths: string[] = await copyTo(invoice.files, folderFile);

    const itemForCreate = [
        ...invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
            state: $Enums.ItemState.IGNORE,
            name: billboard.name,
            hasTax: billboard.hasTax,
            description: billboard.description ?? "",
            quantity: billboard.quantity,
            price: billboard.price,
            updatedPrice: billboard.updatedPrice,
            discount: billboard.discount ?? "0",
            locationStart: billboard.locationStart,
            locationEnd: billboard.locationEnd,
            discountType: billboard.discountType as string,
            currency: billboard.currency!,
            company: {
                connect: { id: invoice.companyId }
            },
            billboard: {
                connect: { id: billboard.billboardId as string },
            },
            itemType: billboard.itemType ?? "billboard"
        })) ?? [],
        ...invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
            state: $Enums.ItemState.IGNORE,
            name: productService.name,
            hasTax: productService.hasTax,
            description: productService.description ?? "",
            quantity: productService.quantity,
            price: productService.price,
            updatedPrice: productService.updatedPrice,
            locationStart: new Date(),
            locationEnd: new Date(),
            discount: productService.discount ?? "0",
            discountType: productService.discountType as string,
            currency: productService.currency!,
            company: {
                connect: { id: invoice.companyId }
            },
            productService: {
                connect: { id: productService.productServiceId as string },
            },
            itemType: productService.itemType ?? "product"
        })) ?? []
    ]

    try {
        const [createdInvoice] = await prisma.$transaction([
            prisma.invoice.create({
                data: {
                    totalHT: invoice.totalHT,
                    discount: invoice.discount!,
                    discountType: invoice.discountType,
                    pathFiles: folderFile,
                    paymentLimit: invoice.paymentLimit,
                    totalTTC: invoice.totalTTC,
                    amountType: invoice.amountType,
                    note: invoice.note!,
                    files: savedPaths,
                    items: {
                        create: itemForCreate
                    },
                    project: {
                        connect: {
                            id: invoice.projectId as string
                        },

                    },
                    client: {
                        connect: {
                            id: invoice.clientId as string
                        }
                    },
                    company: {
                        connect: {
                            id: invoice.companyId
                        }
                    },
                    billboards: {
                        connect: invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                            id: billboard.billboardId as string
                        })) ?? []
                    },
                    productsServices: {
                        connect: invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                            id: productService.productServiceId as string
                        })) ?? []
                    },
                },
            }),
        ])

        return NextResponse.json({
            status: "success",
            message: "Facture dupliquée avec succès.",
            data: createdInvoice,
        });

    } catch (error) {
        await removePath([...savedPaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la duplication de la facture.",
        }, { status: 500 });

    }



}