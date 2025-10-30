import { $Enums } from "@/lib/generated/prisma";
import { ClientContractSchemaType, LessorContractSchemaType } from "@/lib/zod/contract.schema";
import { RequestResponse } from "@/types/api.types";
import { ClientContractType, LessorContractType } from "@/types/contract-types";

export async function getAllContracts({ companyId, filter }: { companyId: string, filter: $Enums.ContractType }) {
    const params = new URLSearchParams();
    params.append("type", filter);

    const queryString = params.toString();

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/contract/${companyId}${queryString ? `?${queryString}` : ""}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        if (filter === "CLIENT") {
            const res: RequestResponse<ClientContractType[]> = await response.json()
            if (!response.ok) {
                throw new Error(res.message);
            }
            return res;
        }

        const res: RequestResponse<LessorContractType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
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

        if (filter === "CLIENT") {
            const res: RequestResponse<ClientContractType> = await response.json()
            if (!response.ok) {
                throw new Error(res.message);
            }
            return res;
        }

        const res: RequestResponse<LessorContractType> = await response.json()
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
