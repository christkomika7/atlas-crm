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

        // -------------------- BILLBOARD - Général --------------------
        const billboard = data.billboard;
        appendIfDefined("companyId", billboard.companyId);
        appendIfDefined("reference", billboard.reference);
        appendIfDefined("hasTax", JSON.stringify(billboard.hasTax));
        appendIfDefined("type", billboard.type);
        appendIfDefined("name", billboard.name);
        appendIfDefined("locality", billboard.locality);
        appendIfDefined("area", billboard.area);
        appendIfDefined("visualMarker", billboard.visualMarker);
        appendIfDefined("displayBoard", billboard.displayBoard);
        appendIfDefined("orientation", billboard.orientation);
        appendIfDefined("city", billboard.city);
        appendIfDefined("gmaps", billboard.gmaps);

        // -------------------- BILLBOARD - Photos/Brochures --------------------
        billboard.photos?.forEach((file) => {
            if (file instanceof File) appendIfDefined("photos", file);
        });

        billboard.brochures?.forEach((file) => {
            if (file instanceof File) appendIfDefined("brochures", file);
        });

        // -------------------- BILLBOARD - Prix --------------------
        appendIfDefined("rentalPrice", billboard.rentalPrice?.toString());
        appendIfDefined("installationCost", billboard.installationCost?.toString() || "0");
        appendIfDefined("maintenance", billboard.maintenance?.toString() || "0");

        // -------------------- BILLBOARD - Infos techniques --------------------
        appendIfDefined("width", billboard.width?.toString());
        appendIfDefined("height", billboard.height?.toString());
        appendIfDefined("lighting", billboard.lighting);
        appendIfDefined("structureType", billboard.structureType);
        appendIfDefined("panelCondition", billboard.panelCondition);
        appendIfDefined("decorativeElement", billboard.decorativeElement);
        appendIfDefined("foundations", billboard.foundations);
        appendIfDefined("electricity", billboard.electricity);
        appendIfDefined("framework", billboard.framework);
        appendIfDefined("note", billboard.note);

        // -------------------- LESSOR - Informations --------------------
        const lessor = data.lessor;
        appendIfDefined("lessorType", lessor.lessorType);
        appendIfDefined("lessorSpaceType", lessor.lessorSpaceType);

        if (lessor.lessorSpaceType === "private") {
            // ----- Prix -----
            appendIfDefined("locationPrice", lessor.locationPrice);
            appendIfDefined("nonLocationPrice", lessor.nonLocationPrice);

            // ----- Personne physique -----
            if (lessor.lessorTypeName === PHYSICAL_COMPANY) {
                appendIfDefined("identityCard", lessor.identityCard);
                appendIfDefined("delayContractStart", lessor.delayContractStart);
                appendIfDefined("delayContractEnd", lessor.delayContractEnd);
            }

            // ----- Personne morale -----
            if (lessor.lessorTypeName === MORAL_COMPANY) {
                appendIfDefined("capital", lessor.capital);
                appendIfDefined("rccm", lessor.rccm);
                appendIfDefined("taxIdentificationNumber", lessor.taxIdentificationNumber);
                appendIfDefined("niu", lessor.niu);
                appendIfDefined("legalForms", lessor.legalForms);

                // ----- Représentant -----
                appendIfDefined("representativeFirstName", lessor.representativeFirstName);
                appendIfDefined("representativeLastName", lessor.representativeLastName);
                appendIfDefined("representativeJob", lessor.representativeJob);
                appendIfDefined("representativePhone", lessor.representativePhone);
                appendIfDefined("representativeEmail", lessor.representativeEmail);

                appendIfDefined("rentalStartDate", lessor.rentalStartDate);
                appendIfDefined("rentalPeriod", lessor.rentalPeriod);
            }


            // ----- Contrat -----
            appendIfDefined("paymentMode", JSON.stringify(lessor.paymentMode));
            appendIfDefined("paymentFrequency", lessor.paymentFrequency);
            appendIfDefined("electricitySupply", lessor.electricitySupply);
            appendIfDefined("specificCondition", lessor.specificCondition);

            // ----- Champs communs -----
            appendIfDefined("lessorName", lessor.lessorName);
            appendIfDefined("lessorAddress", lessor.lessorAddress);
            appendIfDefined("lessorCity", lessor.lessorCity);
            appendIfDefined("lessorPhone", lessor.lessorPhone);
            appendIfDefined("lessorEmail", lessor.lessorEmail);
            appendIfDefined("bankName", lessor.bankName);
            appendIfDefined("rib", lessor.rib);
            appendIfDefined("iban", lessor.iban);
            appendIfDefined("bicSwift", lessor.bicSwift);
        } else {
            // Public -> bailleur client
            appendIfDefined("lessorCustomer", lessor.lessorCustomer);
        }
        // -------------------- Envoi de la requête --------------------
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard`, {
            method: "POST",
            body: formData,
        });

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

        const billboard = data.billboard;
        const lessor = data.lessor;

        // -------------------- BILLBOARD - Général --------------------
        appendIfDefined("id", billboard.id);
        appendIfDefined("companyId", billboard.companyId);
        appendIfDefined("reference", billboard.reference);
        appendIfDefined("hasTax", JSON.stringify(billboard.hasTax));
        appendIfDefined("type", billboard.type);
        appendIfDefined("name", billboard.name);
        appendIfDefined("locality", billboard.locality);
        appendIfDefined("area", billboard.area);
        appendIfDefined("visualMarker", billboard.visualMarker);
        appendIfDefined("displayBoard", billboard.displayBoard);
        appendIfDefined("orientation", billboard.orientation);
        appendIfDefined("city", billboard.city);
        appendIfDefined("gmaps", billboard.gmaps);

        // -------------------- BILLBOARD - Photos/Brochures --------------------
        appendIfDefined("lastPhotos", billboard.lastPhotos?.join(";"));
        appendIfDefined("lastBrochures", billboard.lastBrochures?.join(";"));

        billboard.photos?.forEach((file) => {
            if (file instanceof File) appendIfDefined("photos", file);
        });
        billboard.brochures?.forEach((file) => {
            if (file instanceof File) appendIfDefined("brochures", file);
        });

        // -------------------- BILLBOARD - Prix --------------------
        appendIfDefined("rentalPrice", billboard.rentalPrice?.toString());
        appendIfDefined("installationCost", billboard.installationCost?.toString() || "0");
        appendIfDefined("maintenance", billboard.maintenance?.toString() || "0");

        // -------------------- BILLBOARD - Infos techniques --------------------
        appendIfDefined("width", billboard.width?.toString());
        appendIfDefined("height", billboard.height?.toString());
        appendIfDefined("lighting", billboard.lighting);
        appendIfDefined("structureType", billboard.structureType);
        appendIfDefined("panelCondition", billboard.panelCondition);
        appendIfDefined("decorativeElement", billboard.decorativeElement);
        appendIfDefined("foundations", billboard.foundations);
        appendIfDefined("electricity", billboard.electricity);
        appendIfDefined("framework", billboard.framework);
        appendIfDefined("note", billboard.note);

        // -------------------- LESSOR - Infos bailleur --------------------

        appendIfDefined("lessorType", lessor.lessorType);
        appendIfDefined("lessorSpaceType", lessor.lessorSpaceType);

        if (lessor.lessorSpaceType === "private") {
            // ----- Prix -----
            appendIfDefined("locationPrice", lessor.locationPrice);
            appendIfDefined("nonLocationPrice", lessor.nonLocationPrice);

            // ----- Personne physique -----
            if (lessor.lessorTypeName === PHYSICAL_COMPANY) {
                appendIfDefined("identityCard", lessor.identityCard);
                appendIfDefined("delayContractStart", lessor.delayContractStart);
                appendIfDefined("delayContractEnd", lessor.delayContractEnd);
            }

            // ----- Personne morale -----
            if (lessor.lessorTypeName === MORAL_COMPANY) {
                appendIfDefined("capital", lessor.capital);
                appendIfDefined("rccm", lessor.rccm);
                appendIfDefined("taxIdentificationNumber", lessor.taxIdentificationNumber);
                appendIfDefined("niu", lessor.niu);
                appendIfDefined("legalForms", lessor.legalForms);

                // ----- Représentant -----
                appendIfDefined("representativeFirstName", lessor.representativeFirstName);
                appendIfDefined("representativeLastName", lessor.representativeLastName);
                appendIfDefined("representativeJob", lessor.representativeJob);
                appendIfDefined("representativePhone", lessor.representativePhone);
                appendIfDefined("representativeEmail", lessor.representativeEmail);

                appendIfDefined("rentalStartDate", lessor.rentalStartDate);
                appendIfDefined("rentalPeriod", lessor.rentalPeriod);
            }


            // ----- Contrat -----
            appendIfDefined("paymentMode", JSON.stringify(lessor.paymentMode));
            appendIfDefined("paymentFrequency", lessor.paymentFrequency);
            appendIfDefined("electricitySupply", lessor.electricitySupply);
            appendIfDefined("specificCondition", lessor.specificCondition);

            // ----- Champs communs -----
            appendIfDefined("lessorName", lessor.lessorName);
            appendIfDefined("lessorAddress", lessor.lessorAddress);
            appendIfDefined("lessorCity", lessor.lessorCity);
            appendIfDefined("lessorPhone", lessor.lessorPhone);
            appendIfDefined("lessorEmail", lessor.lessorEmail);
            appendIfDefined("bankName", lessor.bankName);
            appendIfDefined("rib", lessor.rib);
            appendIfDefined("iban", lessor.iban);
            appendIfDefined("bicSwift", lessor.bicSwift);
        } else {
            // Public -> bailleur client
            appendIfDefined("lessorCustomer", lessor.lessorCustomer);
        }

        // -------------------- Envoi de la requête --------------------
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard/${billboard.id}`,
            {
                method: "PUT",
                body: formData,
            }
        );

        const res: RequestResponse<BillboardType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la mise à jour du panneau");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
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
