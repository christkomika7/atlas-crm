import { toDateOnlyString } from "@/lib/date";
import { RequestResponse } from "@/types/api.types";
import { InvoiceType, PaidInfosInvoiceType } from "@/types/invoice.types";
import { RecordType } from "@/types/overview.type";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { CategoryDetailType, CategoryFilterType, DividendType, SourceTransaction, TransactionTotal } from "@/types/transaction.type";
import Decimal from "decimal.js";



export async function getRecords({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/${companyId}`, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<RecordType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function expireInvoices({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/invoice/expire?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<PaidInfosInvoiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function noExpireInvoices({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/invoice/no-expire?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<PaidInfosInvoiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function noExpirePurchaseOrders({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/purchase-order/no-expire?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<PaidInfosInvoiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getVAT({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/transaction/vat?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<Decimal> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getDividends({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/transaction/dividend?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });


        const res: RequestResponse<DividendType[]> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getTransactionTotals({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/transaction/total?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });


        const res: RequestResponse<TransactionTotal> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getCategoryDetails({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/transaction/details?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store",
        });

        const res: RequestResponse<CategoryDetailType[]> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getCategoryByFilters({ companyId, range, category }: { companyId: string, range?: { from?: Date, to?: Date }, category?: string }) {
    const params = new URLSearchParams();

    params.append("companyId", companyId);
    if (category) params.append("category", category);
    if (range && range.from) params.append("start", toDateOnlyString(range.from));
    if (range && range.to) params.append("end", toDateOnlyString(range.to));

    const queryString = params.toString();

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/transaction/filter${queryString ? `?${queryString}` : ""}`;
    try {
        const response = await fetch(
            url,
            {
                method: "GET",
                cache: "no-store"
            },
        );

        const res: RequestResponse<CategoryFilterType> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getBySource({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.append("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/transaction/by?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<SourceTransaction[]> = await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getLatestInvoice({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/invoice/last?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<InvoiceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function getLatestPurchaseOrder({ companyId }: { companyId: string }) {
    const query = new URLSearchParams();
    query.set("companyId", String(companyId));

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/purchase-order/last?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<PurchaseOrderType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}