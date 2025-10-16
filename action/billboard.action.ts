import { BillboardSchemaFormType, EditBillboardSchemaFormType } from "@/lib/zod/billboard.schema";
import { ContractSchemaType } from "@/lib/zod/contract.schema";
import { EmailSchemaType } from "@/lib/zod/email.schema";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";

export async function all({ companyId, search, limit }: { companyId: string, search?: string, limit?: number }) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (limit) params.append("limit", String(limit));

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/${companyId}${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        const res: RequestResponse<BillboardType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function filter(data: ContractSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/filter`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<BillboardType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message);
        }

        return res;
    } catch (error) {
        throw error;
    }
}

export async function email(data: EmailSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/email`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<string> = await response.json();

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<BillboardType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function duplicateBillboard({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/${id}`, {
            method: 'POST',
        });

        const res: RequestResponse<null> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: BillboardSchemaFormType) {
    try {
        const formData = new FormData();

        // BILLBOARD - Général
        formData.append("companyId", data.billboard.companyId);
        formData.append("reference", data.billboard.reference);
        formData.append("type", data.billboard.type);
        formData.append("name", data.billboard.name);
        formData.append("dimension", data.billboard.dimension);
        formData.append("city", data.billboard.city);
        formData.append("area", data.billboard.area);
        formData.append("placement", data.billboard.placement);
        formData.append("orientation", data.billboard.orientation);
        formData.append("information", data.billboard.information ?? "");

        // BILLBOARD - Location
        formData.append("address", data.billboard.address);
        formData.append("gmaps", data.billboard.gmaps);
        formData.append("zone", data.billboard.zone);

        // BILLBOARD - Prix
        formData.append("rentalPrice", data.billboard.rentalPrice.toString());
        formData.append("installationCost", data.billboard.installationCost.toString());
        formData.append("maintenance", data.billboard.maintenance.toString());

        // BILLBOARD - Photos
        data.billboard.imageFiles?.forEach((file) => {
            if (file instanceof File) {
                formData.append("imageFiles", file);
            }
        });

        // BILLBOARD - Brochure
        data.billboard.brochureFiles?.forEach((file) => {
            if (file instanceof File) {
                formData.append("brochureFiles", file);
            }
        });

        // BILLBOARD - Infos techniques
        formData.append("structure", data.billboard.structure);
        formData.append("decorativeElement", data.billboard.decorativeElement);
        formData.append("foundations", data.billboard.foundations);
        formData.append("technicalVisibility", data.billboard.technicalVisibility);
        formData.append("note", data.billboard.note);

        // LESSOR - Infos bailleur
        formData.append("lessorType", data.lessor.lessorType);
        formData.append("lessorSpaceType", data.lessor.lessorSpaceType);
        if (data.lessor.lessorSpaceType === "private") {
            formData.append("lessorName", data.lessor.lessorName as string);
            formData.append("lessorJob", data.lessor.lessorJob as string);
            formData.append("lessorPhone", data.lessor.lessorPhone as string);
            formData.append("lessorEmail", data.lessor.lessorEmail as string);
            formData.append("capital", data.lessor.capital?.toString() || "0");
            formData.append("rccm", data.lessor.rccm as string);
            formData.append("taxIdentificationNumber", data.lessor.taxIdentificationNumber as string);
            formData.append("lessorAddress", data.lessor.lessorAddress as string);

            // LESSOR - Représentant légal
            formData.append("representativeName", data.lessor.representativeName as string);
            formData.append("representativeContract", data.lessor.representativeContract as string);

            // LESSOR - Contrat
            formData.append("leasedSpace", data.lessor.leasedSpace as string);
            formData.append("contractFrom", data.lessor.contractDuration?.from?.toISOString() ?? "");
            formData.append("contractTo", data.lessor.contractDuration?.to?.toISOString() ?? "");
            formData.append("paymentMethod", data.lessor.paymentMethod as string);
            formData.append("specificCondition", data.lessor.specificCondition as string);

            // LESSOR - Documents
            data.lessor.signedLeaseContract?.forEach((file) => {
                if (file instanceof File) {
                    formData.append("signedLeaseContract", file);
                }
            });

            data.lessor.files?.forEach((file) => {
                if (file instanceof File) {
                    formData.append("files", file);
                }
            });

        } else {
            formData.append("lessorCustomer", data.lessor.lessorCustomer as string)
        }

        // Envoi de la requête
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard`,
            {
                method: "POST",
                body: formData,
            }
        );

        const res: RequestResponse<BillboardType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du panneau");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditBillboardSchemaFormType) {
    try {
        const formData = new FormData();

        // BILLBOARD - Général
        formData.append("id", data.billboard.id);
        formData.append("companyId", data.billboard.companyId);
        formData.append("reference", data.billboard.reference);
        formData.append("type", data.billboard.type);
        formData.append("name", data.billboard.name);
        formData.append("dimension", data.billboard.dimension);
        formData.append("city", data.billboard.city);
        formData.append("area", data.billboard.area);
        formData.append("placement", data.billboard.placement);
        formData.append("orientation", data.billboard.orientation);
        formData.append("information", data.billboard.information ?? "");

        // BILLBOARD - Location
        formData.append("address", data.billboard.address);
        formData.append("gmaps", data.billboard.gmaps);
        formData.append("zone", data.billboard.zone);

        // BILLBOARD - Prix
        formData.append("rentalPrice", data.billboard.rentalPrice.toString());
        formData.append("installationCost", data.billboard.installationCost.toString());
        formData.append("maintenance", data.billboard.maintenance.toString());

        // BILLBOARD - Photos
        formData.append("lastImageFiles", data.billboard.lastImageFiles?.join(";") as string)
        data.billboard.imageFiles?.forEach((file) => {
            if (file instanceof File) {
                formData.append("imageFiles", file);
            }
        });


        // BILLBOARD - Brochure
        formData.append("lastBrochureFiles", data.billboard.lastBrochureFiles?.join(";") as string)
        data.billboard.brochureFiles?.forEach((file) => {
            if (file instanceof File) {
                formData.append("brochureFiles", file);
            }
        });

        // BILLBOARD - Infos techniques
        formData.append("structure", data.billboard.structure);
        formData.append("decorativeElement", data.billboard.decorativeElement);
        formData.append("foundations", data.billboard.foundations);
        formData.append("technicalVisibility", data.billboard.technicalVisibility);
        formData.append("note", data.billboard.note);

        // LESSOR - Infos bailleur
        formData.append("lessorType", data.lessor.lessorType);
        formData.append("lessorSpaceType", data.lessor.lessorSpaceType);
        if (data.lessor.lessorSpaceType === "private") {
            formData.append("lessorName", data.lessor.lessorName as string);
            formData.append("lessorJob", data.lessor.lessorJob as string);
            formData.append("lessorPhone", data.lessor.lessorPhone as string);
            formData.append("lessorEmail", data.lessor.lessorEmail as string);
            formData.append("capital", data.lessor.capital?.toString() || "0");
            formData.append("rccm", data.lessor.rccm as string);
            formData.append("taxIdentificationNumber", data.lessor.taxIdentificationNumber as string);
            formData.append("lessorAddress", data.lessor.lessorAddress as string);

            // LESSOR - Représentant légal
            formData.append("representativeName", data.lessor.representativeName as string);
            formData.append("representativeContract", data.lessor.representativeContract as string);

            // LESSOR - Contrat
            formData.append("leasedSpace", data.lessor.leasedSpace as string);
            formData.append("contractFrom", data.lessor.contractDuration?.from?.toISOString() ?? "");
            formData.append("contractTo", data.lessor.contractDuration?.to?.toISOString() ?? "");
            formData.append("paymentMethod", data.lessor.paymentMethod as string);
            formData.append("specificCondition", data.lessor.specificCondition as string);

            // LESSOR - Documents
            // LESSOR - Documents
            formData.append("lastSignedLeaseContract", data.lessor.lastSignedLeaseContract?.join(";") as string)
            data.lessor.signedLeaseContract?.forEach((file) => {
                if (file instanceof File) {
                    formData.append("signedLeaseContract", file);
                }
            });

            formData.append("lastFiles", data.lessor.lastFiles?.join(";") as string)
            data.lessor.files?.forEach((file) => {
                if (file instanceof File) {
                    formData.append("files", file);
                }
            });

        } else {
            formData.append("lessorCustomer", data.lessor.lessorCustomer as string)
        }

        // Envoi de la requête
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/${data.billboard.id}`,
            {
                method: "PUT",
                body: formData,
            }
        );

        const res: RequestResponse<BillboardType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du panneau");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<BillboardType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function removeMany({ ids }: { ids: string[] }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<BillboardType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}