import { DEFAULT_PAGE_SIZE, MORAL_COMPANY, PHYSICAL_COMPANY } from "@/config/constant";
import { BaseSchemaType } from "@/lib/zod/base-type.schema";
import { BillboardSchemaFormType, EditBillboardSchemaFormType } from "@/lib/zod/billboard.schema";
import { ContractSchemaType } from "@/lib/zod/contract.schema";
import { EmailSchemaType } from "@/lib/zod/email.schema";
import { RequestResponse } from "@/types/api.types";
import { BaseType } from "@/types/base.types";
import { BillboardType } from "@/types/billboard.types";

export async function all({ companyId, search, lessor, lessorType, skip = 0, take = DEFAULT_PAGE_SIZE }: { companyId: string, search?: string, limit?: number, lessor?: string, lessorType?: string, skip?: number, take?: number }) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (lessor) params.append("lessor", String(lessor));
    if (lessorType) params.append("lessorType", String(lessorType));
    params.append("skip", String(skip));
    params.append("take", String(take));

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

        const appendIfDefined = (key: string, value: any) => {
            if (value !== undefined && value !== null && value !== "") {
                formData.append(key, value);
            }
        };

        // BILLBOARD - Général
        formData.append("companyId", data.billboard.companyId);
        formData.append("reference", data.billboard.reference);
        formData.append("hasTax", JSON.stringify(data.billboard.hasTax));
        formData.append("type", data.billboard.type);
        formData.append("name", data.billboard.name);
        formData.append("locality", data.billboard.locality);
        formData.append("area", data.billboard.area);
        formData.append("visualMarker", data.billboard.visualMarker);
        formData.append("displayBoard", data.billboard.displayBoard);


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

            // --- PRICES --- //
            appendIfDefined("locationPrice", data.lessor.locationPrice);
            appendIfDefined("nonLocationPrice", data.lessor.nonLocationPrice);

            // --- PHYSICAL PERSON --- //
            appendIfDefined("identityCard", data.lessor.identityCard);
            appendIfDefined("delayContract", JSON.stringify(data.lessor.delayContract));

            // --- MORAL PERSON --- //
            appendIfDefined("capital", data.lessor.capital?.toString());
            appendIfDefined("rccm", data.lessor.rccm);
            appendIfDefined("taxIdentificationNumber", data.lessor.taxIdentificationNumber);
            appendIfDefined("niu", data.lessor.niu);
            appendIfDefined("legalForms", data.lessor.legalForms);

            // --- REPRESENTATIVE --- //
            appendIfDefined("representativeFirstName", data.lessor.representativeFirstName);
            appendIfDefined("representativeLastName", data.lessor.representativeLastName);
            appendIfDefined("representativeJob", data.lessor.representativeJob);
            appendIfDefined("representativePhone", data.lessor.representativePhone);
            appendIfDefined("representativeEmail", data.lessor.representativeEmail);

            // --- CONTRACT DATES --- //
            appendIfDefined("rentalStartDate", data.lessor.rentalStartDate?.toISOString() || undefined);
            appendIfDefined("rentalPeriod", data.lessor.rentalPeriod);

            // --- COMMON FIELDS --- //
            appendIfDefined("lessorName", data.lessor.lessorName);
            appendIfDefined("lessorAddress", data.lessor.lessorAddress);
            appendIfDefined("lessorCity", data.lessor.lessorCity);
            appendIfDefined("lessorPhone", data.lessor.lessorPhone);
            appendIfDefined("lessorEmail", data.lessor.lessorEmail);
            appendIfDefined("bankName", data.lessor.bankName);
            appendIfDefined("rib", data.lessor.rib);
            appendIfDefined("iban", data.lessor.iban);
            appendIfDefined("bicSwift", data.lessor.bicSwift);

            // --- CONTRACT --- //
            appendIfDefined("paymentMode", JSON.stringify(data.lessor.paymentMode));
            appendIfDefined("paymentFrequency", data.lessor.paymentFrequency);
            appendIfDefined("electricitySupply", data.lessor.electricitySupply);
            appendIfDefined("specificCondition", data.lessor.specificCondition);

        } else {
            appendIfDefined("lessorCustomer", data.lessor.lessorCustomer);
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

        const appendIfDefined = (key: string, value: any) => {
            if (value !== undefined && value !== null && value !== "") {
                formData.append(key, value);
            }
        };

        // BILLBOARD - Général
        formData.append("id", data.billboard.id);
        formData.append("companyId", data.billboard.companyId);
        formData.append("reference", data.billboard.reference);
        formData.append("hasTax", JSON.stringify(data.billboard.hasTax));
        formData.append("type", data.billboard.type);
        formData.append("name", data.billboard.name);
        formData.append("locality", data.billboard.locality);
        formData.append("area", data.billboard.area);
        formData.append("visualMarker", data.billboard.visualMarker);
        formData.append("displayBoard", data.billboard.displayBoard);


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
        formData.append("lessorSpaceType", data.lessor.lessorSpaceType)
        if (data.lessor.lessorSpaceType === "private") {

            // --- PRICES --- //
            appendIfDefined("locationPrice", data.lessor.locationPrice);
            appendIfDefined("nonLocationPrice", data.lessor.nonLocationPrice);

            // --- PHYSICAL PERSON --- //
            appendIfDefined("identityCard", data.lessor.identityCard);
            appendIfDefined("delayContract", JSON.stringify(data.lessor.delayContract));

            // --- MORAL PERSON --- //
            appendIfDefined("capital", data.lessor.capital?.toString());
            appendIfDefined("rccm", data.lessor.rccm);
            appendIfDefined("taxIdentificationNumber", data.lessor.taxIdentificationNumber);
            appendIfDefined("niu", data.lessor.niu);
            appendIfDefined("legalForms", data.lessor.legalForms);

            // --- REPRESENTATIVE --- //
            appendIfDefined("representativeFirstName", data.lessor.representativeFirstName);
            appendIfDefined("representativeLastName", data.lessor.representativeLastName);
            appendIfDefined("representativeJob", data.lessor.representativeJob);
            appendIfDefined("representativePhone", data.lessor.representativePhone);
            appendIfDefined("representativeEmail", data.lessor.representativeEmail);

            // --- CONTRACT DATES --- //
            appendIfDefined("rentalStartDate", data.lessor.rentalStartDate?.toISOString() || undefined);
            appendIfDefined("rentalPeriod", data.lessor.rentalPeriod);

            // --- COMMON FIELDS --- //
            appendIfDefined("lessorName", data.lessor.lessorName);
            appendIfDefined("lessorAddress", data.lessor.lessorAddress);
            appendIfDefined("lessorCity", data.lessor.lessorCity);
            appendIfDefined("lessorPhone", data.lessor.lessorPhone);
            appendIfDefined("lessorEmail", data.lessor.lessorEmail);
            appendIfDefined("bankName", data.lessor.bankName);
            appendIfDefined("rib", data.lessor.rib);
            appendIfDefined("iban", data.lessor.iban);
            appendIfDefined("bicSwift", data.lessor.bicSwift);

            // --- CONTRACT --- //
            appendIfDefined("paymentMode", JSON.stringify(data.lessor.paymentMode));
            appendIfDefined("paymentFrequency", data.lessor.paymentFrequency);
            appendIfDefined("electricitySupply", data.lessor.electricitySupply);
            appendIfDefined("specificCondition", data.lessor.specificCondition);

        } else {
            appendIfDefined("lessorCustomer", data.lessor.lessorCustomer);
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


export async function getBillboardLessorType({ companyId, lessorSpace }: { companyId: string, lessorSpace?: string }) {
    const params = new URLSearchParams();
    if (lessorSpace) params.append("lessorSpace", lessorSpace);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/lessor-type/${companyId}${queryString ? `?${queryString}` : ""
        }`;

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

export async function createBillboardElement(data: BaseSchemaType & { type: "display-board" | "lessor-type" | "structure-type", lessorSpace?: "private" | "public" }) {

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
            body: JSON.stringify({ companyId: data.companyId, name: data.name, lessorSpace: data.lessorSpace }),
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
