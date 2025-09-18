import { AllocationSchemaType, CategorySchemaType, NatureSchemaType, SourceSchemaType } from "@/lib/zod/transaction.schema";
import { RequestResponse } from "@/types/api.types";
import { AllocationType, SourceType, TransactionCategoryType, TransactionNatureType } from "@/types/transaction.type";

export async function getReference({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/${companyId}/reference`, {
            method: 'GET',
        });

        const res: RequestResponse<number> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getCategories({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<TransactionCategoryType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function getSources({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<SourceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getAllocations({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/allocation/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<AllocationType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}




export async function getNatures({ categoryId }: { categoryId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature/${categoryId}`, {
            method: 'GET',
        });

        const res: RequestResponse<TransactionNatureType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function createCategory(data: CategorySchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<TransactionCategoryType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la catégorie de la transaction");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function createNature(data: NatureSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<TransactionNatureType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la nature de la transaction");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function createSource(data: SourceSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<SourceType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la source de la transaction");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function createAllocation(data: AllocationSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/allocation`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<AllocationType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de l'allocation");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function deleteCategory({ categoryId }: { categoryId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category/${categoryId}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<TransactionCategoryType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function deleteNature({ natureId }: { natureId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature/${natureId}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<TransactionNatureType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function deleteSource({ sourceId }: { sourceId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source/${sourceId}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<SourceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function deleteAllocation({ allocationId }: { allocationId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/allocation/${allocationId}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<AllocationType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}