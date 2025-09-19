import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    checkAccess(["TRANSACTION"], "CREATE");

    const companyId = getIdFromUrl(req.url, 2);
    if (!companyId) {
        return NextResponse.json(
            { status: "error", message: "Identifiant invalide." },
            { status: 404 }
        );
    }

    const { searchParams } = new URL(req.url);

    // pagination
    const cursor = searchParams.get("cursor");
    const take = parseInt(searchParams.get("take") || "10", 10);

    // filtres directs
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const movementValue = searchParams.get("movementValue");
    const categoryValue = searchParams.get("categoryValue");
    const paymentModeValue = searchParams.get("paymentModeValue");
    const sourceValue = searchParams.get("sourceValue");
    const paidForValue = searchParams.get("paidForValue");

    // filtres de tri (un seul sera présent)
    const sortKeys = [
        "byDate",
        "byAmount",
        "byMovement",
        "byCategory",
        "byNature",
        "byDescription",
        "byPaymentMode",
        "byAllocation",
        "bySource",
        "byPaidOnBehalfOf",
    ] as const;

    const activeSort = sortKeys.find((key) => searchParams.has(key));
    const sortOrder = activeSort ? (searchParams.get(activeSort) as "asc" | "desc") : null;

    // build where commun
    const where: any = { companyId };

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }
    if (movementValue) where.movement = movementValue;
    if (categoryValue) where.categoryId = categoryValue;
    if (paymentModeValue) where.paymentModeId = paymentModeValue;
    if (sourceValue) where.sourceId = sourceValue;
    if (paidForValue) where.paidForId = paidForValue;

    // build orderBy
    let orderBy: any = { createdAt: "desc" }; // fallback

    if (activeSort && sortOrder) {
        switch (activeSort) {
            case "byDate":
                orderBy = { date: sortOrder };
                break;
            case "byAmount":
                orderBy = { amount: sortOrder };
                break;
            case "byMovement":
                orderBy = { movement: sortOrder };
                break;
            case "byCategory":
                orderBy = { category: { name: sortOrder } };
                break;
            case "byNature":
                orderBy = { nature: { name: sortOrder } };
                break;
            case "byDescription":
                orderBy = { description: sortOrder };
                break;
            case "byPaymentMode":
                orderBy = { paymentMode: { name: sortOrder } };
                break;
            case "byAllocation":
                orderBy = { allocation: { name: sortOrder } };
                break;
            case "bySource":
                orderBy = { source: { name: sortOrder } };
                break;
            case "byPaidOnBehalfOf":
                orderBy = { paidFor: { name: sortOrder } };
                break;
        }
    }

    // fetch receipts & disbursements
    const receipts = await prisma.receipt.findMany({
        where,
        take: take + 1, // +1 pour détecter s'il y a une page suivante
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
        select: {
            id: true,
            type: true,
            reference: true,
            date: true,
            movement: true,
            amount: true,
            description: true,
            category: { select: { id: true, name: true } },
            paymentType: true,
            source: { select: { id: true, name: true } },
            nature: { select: { id: true, name: true } },
            createdAt: true,
        },
    });

    const disbursements = await prisma.dibursement.findMany({
        where,
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
        select: {
            id: true,
            type: true,
            reference: true,
            date: true,
            movement: true,
            amount: true,
            description: true,
            category: { select: { id: true, name: true } },
            paymentType: true,
            source: { select: { id: true, name: true } },
            payOnBehalfOf: { select: { id: true, name: true } },
            allocation: { select: { id: true, name: true } },
            nature: { select: { id: true, name: true } },
            createdAt: true,
        },
    });

    // merge côté Node
    let transactions = [...receipts, ...disbursements];

    // ⚠️ Comme on a deux queries séparées, il faut re-trier après merge
    // mais la base a déjà fait 90% du travail, donc c'est léger
    transactions.sort((a, b) => {
        if (activeSort === "byAmount") {
            return sortOrder === "asc" ? parseFloat(a.amount) - parseFloat(b.amount) : parseFloat(b.amount) - parseFloat(a.amount);
        }
        if (activeSort === "byDate") {
            return sortOrder === "asc"
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (activeSort === "byDescription") {
            return sortOrder === "asc"
                ? (a.description ?? "").localeCompare(b.description ?? "")
                : (b.description ?? "").localeCompare(a.description ?? "");
        }
        if (activeSort === "byCategory") {
            return sortOrder === "asc"
                ? (a.category?.name ?? "").localeCompare(b.category?.name ?? "")
                : (b.category?.name ?? "").localeCompare(a.category?.name ?? "");
        }
        // etc. pour les autres
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // pagination manuelle
    const paginated = transactions.slice(0, take);
    const nextCursor = transactions.length > take ? transactions[take].id : null;

    return NextResponse.json(
        {
            status: "success",
            data: paginated,
            nextCursor,
        },
        { status: 200 }
    );
}
