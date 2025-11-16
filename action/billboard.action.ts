import { BaseSchemaType } from "@/lib/zod/base-type.schema";
import { BillboardSchemaFormType, EditBillboardSchemaFormType } from "@/lib/zod/billboard.schema";
import { ContractSchemaType } from "@/lib/zod/contract.schema";
import { EmailSchemaType } from "@/lib/zod/email.schema";
import { RequestResponse } from "@/types/api.types";
import { BaseType } from "@/types/base.types";
import { BillboardType } from "@/types/billboard.types";

export async function all({ companyId, search, limit, lessor, lessorType }: { companyId: string, search?: string, limit?: number, lessor?: string, lessorType?: string }) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (limit) params.append("limit", String(limit));
    if (lessor) params.append("lessor", String(lessor));
    if (lessorType) params.append("lessorType", String(lessorType));

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
        formData.append("hasTax", JSON.stringify(data.billboard.hasTax));
        formData.append("type", data.billboard.type);
        formData.append("name", data.billboard.name);
        formData.append("locality", data.billboard.locality);
        formData.append("zone", data.billboard.zone);
        formData.append("area", data.billboard.area);
        formData.append("visualMarker", data.billboard.visualMarker);
        formData.append("displayBoard", data.billboard.displayBoard);


        formData.append("address", data.billboard.address);
        formData.append("orientation", data.billboard.orientation);
        formData.append("city", data.billboard.city);
        formData.append("gmaps", data.billboard.gmaps);

        // BILLBOARD - Photos
        data.billboard.photos?.forEach((file) => {
            if (file instanceof File) {
                formData.append("photos", file);
            }
        });

        // BILLBOARD - Brochure
        data.billboard.brochures?.forEach((file) => {
            if (file instanceof File) {
                formData.append("brochures", file);
            }
        });

        // BILLBOARD - Prix
        formData.append("rentalPrice", data.billboard.rentalPrice.toString());
        formData.append("installationCost", data.billboard.installationCost ? data.billboard.installationCost.toString() : "0");
        formData.append("maintenance", data.billboard.maintenance ? data.billboard.maintenance.toString() : "0");

        // BILLBOARD - Infos techniques
        formData.append("width", data.billboard.width.toString());
        formData.append("height", data.billboard.height.toString());
        formData.append("lighting", data.billboard.lighting);
        formData.append("structureType", data.billboard.structureType);
        formData.append("panelCondition", data.billboard.panelCondition);
        formData.append("decorativeElement", data.billboard.decorativeElement);
        formData.append("foundations", data.billboard.foundations);
        formData.append("electricity", data.billboard.electricity);
        formData.append("framework", data.billboard.framework);
        formData.append("note", data.billboard.note);

        // LESSOR - Infos bailleur
        formData.append("lessorType", data.lessor.lessorType);
        formData.append("lessorSpaceType", data.lessor.lessorSpaceType);
        if (data.lessor.lessorSpaceType === "private") {
            formData.append("lessorName", data.lessor.lessorName as string);
            formData.append("lessorAddress", data.lessor.lessorAddress as string);
            formData.append("lessorCity", data.lessor.lessorCity as string);
            formData.append("lessorPhone", data.lessor.lessorPhone as string);
            formData.append("lessorEmail", data.lessor.lessorEmail as string);
            formData.append("capital", data.lessor.capital?.toString() || "0");
            formData.append("rccm", data.lessor.rccm as string);
            formData.append("taxIdentificationNumber", data.lessor.taxIdentificationNumber as string);
            formData.append("niu", data.lessor.niu || "");
            formData.append("legalForms", data.lessor.legalForms as string);
            formData.append("bankName", data.lessor.bankName as string);
            formData.append("rib", data.lessor.rib as string);
            formData.append("iban", data.lessor.iban as string);
            formData.append("bicSwift", data.lessor.bicSwift as string);


            // LESSOR - Représentant légal
            formData.append("representativeFirstName", data.lessor.representativeFirstName as string);
            formData.append("representativeLastName", data.lessor.representativeLastName as string);
            formData.append("representativeJob", data.lessor.representativeJob as string);
            formData.append("representativePhone", data.lessor.representativePhone as string);
            formData.append("representativeEmail", data.lessor.representativeEmail as string);


            // LESSOR - Contrat
            formData.append("rentalStartDate", data.lessor.rentalStartDate?.toISOString() ?? "");
            formData.append("rentalPeriod", data.lessor.rentalPeriod as string);
            formData.append("paymentMode", JSON.stringify(data.lessor.paymentMode));
            formData.append("paymentFrequency", data.lessor.paymentFrequency as string);
            formData.append("electricitySupply", data.lessor.electricitySupply as string);
            formData.append("specificCondition", data.lessor.specificCondition as string);

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
        formData.append("hasTax", JSON.stringify(data.billboard.hasTax));
        formData.append("type", data.billboard.type);
        formData.append("name", data.billboard.name);
        formData.append("locality", data.billboard.locality);
        formData.append("zone", data.billboard.zone);
        formData.append("area", data.billboard.area);
        formData.append("visualMarker", data.billboard.visualMarker);
        formData.append("displayBoard", data.billboard.displayBoard);


        formData.append("address", data.billboard.address);
        formData.append("orientation", data.billboard.orientation);
        formData.append("city", data.billboard.city);
        formData.append("gmaps", data.billboard.gmaps);


        formData.append("lastPhotos", data.billboard.lastPhotos?.join(";") as string)
        formData.append("lastBrochures", data.billboard.lastBrochures?.join(";") as string)
        data.billboard.photos?.forEach((file) => {
            if (file instanceof File) {
                formData.append("photos", file);
            }
        });
        data.billboard.brochures?.forEach((file) => {
            if (file instanceof File) {
                formData.append("brochures", file);
            }
        });

        // BILLBOARD - Prix
        formData.append("rentalPrice", data.billboard.rentalPrice.toString());
        formData.append("installationCost", data.billboard.installationCost ? data.billboard.installationCost.toString() : "0");
        formData.append("maintenance", data.billboard.maintenance ? data.billboard.maintenance.toString() : "0");

        // BILLBOARD - Infos techniques
        formData.append("width", data.billboard.width.toString());
        formData.append("height", data.billboard.height.toString());
        formData.append("lighting", data.billboard.lighting);
        formData.append("structureType", data.billboard.structureType);
        formData.append("panelCondition", data.billboard.panelCondition);
        formData.append("decorativeElement", data.billboard.decorativeElement);
        formData.append("foundations", data.billboard.foundations);
        formData.append("electricity", data.billboard.electricity);
        formData.append("framework", data.billboard.framework);
        formData.append("note", data.billboard.note);

        // LESSOR - Infos bailleur
        formData.append("lessorType", data.lessor.lessorType);
        formData.append("lessorSpaceType", data.lessor.lessorSpaceType);

        if (data.lessor.lessorSpaceType === "private") {
            formData.append("lessorName", data.lessor.lessorName as string);
            formData.append("lessorAddress", data.lessor.lessorAddress as string);
            formData.append("lessorCity", data.lessor.lessorCity as string);
            formData.append("lessorPhone", data.lessor.lessorPhone as string);
            formData.append("lessorEmail", data.lessor.lessorEmail as string);
            formData.append("capital", data.lessor.capital?.toString() || "0");
            formData.append("rccm", data.lessor.rccm as string);
            formData.append("taxIdentificationNumber", data.lessor.taxIdentificationNumber as string);
            formData.append("niu", data.lessor.niu || "");
            formData.append("legalForms", data.lessor.legalForms as string);
            formData.append("bankName", data.lessor.bankName as string);
            formData.append("rib", data.lessor.rib as string);
            formData.append("iban", data.lessor.iban as string);
            formData.append("bicSwift", data.lessor.bicSwift as string);


            // LESSOR - Représentant légal
            formData.append("representativeFirstName", data.lessor.representativeFirstName as string);
            formData.append("representativeLastName", data.lessor.representativeLastName as string);
            formData.append("representativeJob", data.lessor.representativeJob as string);
            formData.append("representativePhone", data.lessor.representativePhone as string);
            formData.append("representativeEmail", data.lessor.representativeEmail as string);


            // LESSOR - Contrat
            formData.append("rentalStartDate", data.lessor.rentalStartDate?.toISOString() ?? "");
            formData.append("rentalPeriod", data.lessor.rentalPeriod as string);
            formData.append("paymentMode", JSON.stringify(data.lessor.paymentMode));
            formData.append("paymentFrequency", data.lessor.paymentFrequency as string);
            formData.append("electricitySupply", data.lessor.electricitySupply as string);
            formData.append("specificCondition", data.lessor.specificCondition as string);

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


export async function getBillboardDisplayBoard({ companyId }: { companyId: string }) {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/display_board/${companyId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        const res: RequestResponse<BaseType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function getBillboardLessorType({ companyId }: { companyId: string }) {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/lessor-type/${companyId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        const res: RequestResponse<BaseType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function getBillboardStructureType({ companyId }: { companyId: string }) {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/structure-type/${companyId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        const res: RequestResponse<BaseType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function createBillboardElement(data: BaseSchemaType & { type: "display-board" | "lessor-type" | "structure-type" }) {

    let url = "";

    switch (data.type) {
        case "display-board":
            url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/display_board`;
            break;
        case "lessor-type":
            url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/lessor-type`;
            break;
        case "structure-type":
            url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/structure-type`;
            break;

    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyId: data.companyId, name: data.name }),
        });

        const res: RequestResponse<BaseType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function removeBillboardElements({ id, type }: { id: string, type: "display-board" | "lessor-type" | "structure-type" }) {
    let url = "";

    switch (type) {
        case "display-board":
            url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/display_board/${id}`;
            break;
        case "lessor-type":
            url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/lessor-type/${id}`;
            break;
        case "structure-type":
            url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/structure-type/${id}`;
            break;
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });

        const res: RequestResponse<BaseType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
