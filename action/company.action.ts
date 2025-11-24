import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import { toDateOnlyString } from "@/lib/date";
import { CompanySchemaType, EditCompanySchemaType } from "@/lib/zod/company.schema";
import { RequestResponse } from "@/types/api.types";
import { CompanyType, FilterDataType } from "@/types/company.types";

export async function all(skip = 0, take = DEFAULT_PAGE_SIZE) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/company?skip=${skip}&take=${take}`,
            {
                method: "GET",
            }
        );

        const res: RequestResponse<CompanyType[]> = await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}


export async function filterDatas({ companyId, reportType, period, start, end }: { companyId: string, reportType?: string, period?: string, start?: Date, end?: Date }) {
    const params = new URLSearchParams();
    if (reportType) params.append("reportType", reportType || "salesByClient");
    if (period) params.append("period", period);
    if (start) params.append("start", toDateOnlyString(start));
    if (end) params.append("end", toDateOnlyString(end));
    const queryString = params.toString();

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/company/${companyId}/filter${queryString ? `?${queryString}` : ""}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        const res: RequestResponse<FilterDataType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function unique({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/company/${id}`);
        const res = await response.json();

        if (!response.ok) throw new Error(res.message);
        return res

    } catch (error) {
        throw error;
    }
}

export async function create(data: CompanySchemaType) {
    try {

        const formData = new FormData();

        const vatRateData = data.vatRate;
        const fiscalData = data.fiscal;

        formData.append("companyName", data.companyName);
        formData.append("country", data.country);
        formData.append("city", data.city);
        formData.append("codePostal", data.codePostal ?? "");
        formData.append("registeredAddress", data.registeredAddress);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("email", data.email);
        formData.append("niu", data.niu);
        formData.append("legalForms", data.legalForms);
        formData.append("website", data.website ?? "");
        formData.append("businessRegistrationNumber", data.businessRegistrationNumber);
        formData.append("taxIdentificationNumber", data.taxIdentificationNumber);
        formData.append("capitalAmount", data.capitalAmount);
        formData.append("currency", data.currency);
        formData.append("bankAccountDetails", data.bankAccountDetails);
        formData.append("businessActivityType", data.businessActivityType);

        formData.append('vatRate', JSON.stringify(vatRateData));
        formData.append('fiscal', JSON.stringify(fiscalData));

        const response = await fetch('/api/company', {
            method: 'POST',
            body: formData,
        });

        const res: RequestResponse<CompanyType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res
    } catch (error) {
        throw error;
    }
}

export async function update(data: EditCompanySchemaType) {
    try {

        const formData = new FormData();

        const vatRateData = data.vatRate;
        const fiscalData = data.fiscal;

        formData.append("companyName", data.companyName);
        formData.append("country", data.country);
        formData.append("city", data.city);
        formData.append("codePostal", data.codePostal ?? "");
        formData.append("registeredAddress", data.registeredAddress);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("email", data.email);
        formData.append("website", data.website ?? "");
        formData.append("niu", data.niu);
        formData.append("legalForms", data.legalForms);
        formData.append("businessRegistrationNumber", data.businessRegistrationNumber);
        formData.append("taxIdentificationNumber", data.taxIdentificationNumber);
        formData.append("capitalAmount", data.capitalAmount);
        formData.append("currency", data.currency);
        formData.append("bankAccountDetails", data.bankAccountDetails);
        formData.append("businessActivityType", data.businessActivityType);

        formData.append('vatRate', JSON.stringify(vatRateData));
        formData.append('fiscal', JSON.stringify(fiscalData));

        const response = await fetch(`/api/company/${data.id}`, {
            method: 'PUT',
            body: formData,
        });

        const res: RequestResponse<CompanyType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res
    } catch (error) {
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/company/${id}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<CompanyType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function countries({ id, currentCompany }: { id: string, currentCompany?: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/company/${id}/countries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentCompany }),
        });

        const res = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
