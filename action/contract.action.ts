import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import { $Enums } from "@/lib/generated/prisma";
import { ClientContractSchemaType, LessorContractSchemaType } from "@/lib/zod/contract.schema";
import { RequestResponse } from "@/types/api.types";
import { ClientContractType, ContractType, LessorContractType } from "@/types/contract-types";

export async function getAllContracts({
    companyId,
    filter,
    skip = 0,
    take = DEFAULT_PAGE_SIZE,
}: {
    companyId: string;
    filter: $Enums.ContractType;
    skip?: number;
    take?: number;
}): Promise<
    RequestResponse<ClientContractType[] | LessorContractType[]> & { total?: number }
> {
    const params = new URLSearchParams();
    params.append("type", filter);
    params.append("skip", String(skip));
    params.append("take", String(take));

    const queryString = params.toString();

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract/${companyId}${queryString ? `?${queryString}` : ""
        }`;
    try {
        const response = await fetch(url, {
            method: "GET",
        });

        const res = await response.json();

        if (!response.ok) {
            // res.message is expected per your API shape
            throw new Error(res.message || "Erreur lors de la récupération des contrats");
        }

        // On attend que le backend renvoie { state, data, total }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getUniqueContract({ id, filter }: { id: string; filter: $Enums.ContractType }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<ContractType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function createContract(data: ClientContractSchemaType | LessorContractSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract/${data.company}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (data.type === "CLIENT") {
            const res: RequestResponse<ClientContractType> = await response.json();
            if (!response.ok) {
                throw new Error(res.message || "Erreur lors de la création du contrat");
            }
            return res;
        }
        const res: RequestResponse<LessorContractType> = await response.json();
        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du contrat");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function updateContract(data: ClientContractSchemaType | LessorContractSchemaType) {
    try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract/${data.id}/edit`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (data.type === "CLIENT") {
            const res: RequestResponse<ClientContractType> = await response.json();
            if (!response.ok) {
                throw new Error(res.message || "Erreur lors de la modification du contrat");
            }
            return res;
        }
        const res: RequestResponse<LessorContractType> = await response.json();
        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification du contrat");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function removeContract({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract/${id}`, {
            method: 'DELETE',

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

export async function removeManyContract({ ids }: { ids: string[] }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
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


export async function exportToWord(data: { contract: ContractType }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/upload/word`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errRes = await response.json().catch(() => null);
            throw new Error(errRes?.message || "Erreur lors de l'export Word");
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.docx';
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { status: "success", message: "Fichier téléchargé avec succès" };
    } catch (error) {
        console.error("Erreur dans la fonction exportToWord:", error);
        throw error;
    }
}