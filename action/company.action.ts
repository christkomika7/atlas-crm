import { urlToFile } from "@/lib/utils";
import { CompanySchemaType, EditCompanySchemaType } from "@/lib/zod/company.schema";
import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { UserType } from "@/types/user.types";

export async function all() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/company`, {
            method: 'GET',
        });

        const res: RequestResponse<CompanyType<UserType>[]> = await response.json()
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

        const employees = res.data.employees || [];

        // Pour chaque employé, on reconstruit les fichiers (image, passport, document)
        const updatedEmployees = await Promise.all(
            employees.map(async (emp: any) => {
                const profile = emp.profile;
                const [image, passport, document] = await Promise.all([
                    emp?.image ? urlToFile(emp.image) : null,
                    profile?.passport ? urlToFile(profile.passport) : null,
                    profile?.internalRegulations ? urlToFile(profile.internalRegulations) : null,
                ]);

                return {
                    ...emp,
                    image,
                    profile: {
                        ...profile,
                        passport,
                        internalRegulations: document,
                    },
                };
            })
        );

        return {
            ...res,
            data: {
                ...res.data,
                employees: updatedEmployees,
            },
        };
    } catch (error) {
        throw error;
    }
}

export async function create(data: CompanySchemaType) {
    try {

        const formData = new FormData();

        const employeesData = data.employees;
        const vatRateData = data.vatRate;
        const fiscalData = data.fiscal;

        employeesData.forEach((employee, index) => {
            formData.append(`employees[${index}]`, JSON.stringify({ ...employee, image: undefined }));
            if (employee.image instanceof File) {
                formData.append(`images[${index}]`, employee.image);
            }
            if (employee.passport instanceof File) {
                formData.append(`passport[${index}]`, employee.passport);
            }
            if (employee.document instanceof File) {
                formData.append(`document[${index}]`, employee.document);
            }
        });


        formData.append("companyName", data.companyName);
        formData.append("country", data.country);
        formData.append("city", data.city);
        formData.append("codePostal", data.codePostal ?? "");
        formData.append("registeredAddress", data.registeredAddress);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("email", data.email);
        formData.append("website", data.website ?? "");
        formData.append("businessRegistrationNumber", data.businessRegistrationNumber);
        formData.append("taxIdentificationNumber", data.taxIdentificationNumber);
        formData.append("capitalAmount", data.capitalAmount);
        formData.append("currency", data.currency);
        formData.append("bankAccountDetails", data.bankAccountDetails);
        formData.append("businessActivityType", data.businessActivityType);

        formData.append('employees', JSON.stringify(employeesData));
        formData.append('vatRate', JSON.stringify(vatRateData));
        formData.append('fiscal', JSON.stringify(fiscalData));

        const response = await fetch('/api/company', {
            method: 'POST',
            body: formData,
        });

        const res: RequestResponse<CompanyType<UserType>> = await response.json()
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

        const employeesData = data.employees;
        const vatRateData = data.vatRate;
        const fiscalData = data.fiscal;

        employeesData.forEach((employee, index) => {
            formData.append(`employees[${index}]`, JSON.stringify({ ...employee, image: undefined }));
            if (employee.image instanceof File) {
                formData.append(`images[${index}]`, employee.image);
            }
            if (employee.passport instanceof File) {
                formData.append(`passport[${index}]`, employee.passport);
            }
            if (employee.document instanceof File) {
                formData.append(`document[${index}]`, employee.document);
            }
        });


        formData.append("companyName", data.companyName);
        formData.append("country", data.country);
        formData.append("city", data.city);
        formData.append("codePostal", data.codePostal ?? "");
        formData.append("registeredAddress", data.registeredAddress);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("email", data.email);
        formData.append("website", data.website ?? "");
        formData.append("businessRegistrationNumber", data.businessRegistrationNumber);
        formData.append("taxIdentificationNumber", data.taxIdentificationNumber);
        formData.append("capitalAmount", data.capitalAmount);
        formData.append("currency", data.currency);
        formData.append("bankAccountDetails", data.bankAccountDetails);
        formData.append("businessActivityType", data.businessActivityType);

        formData.append('employees', JSON.stringify(employeesData));
        formData.append('vatRate', JSON.stringify(vatRateData));
        formData.append('fiscal', JSON.stringify(fiscalData));

        const response = await fetch(`/api/company/${data.id}`, {
            method: 'PUT',
            body: formData,
        });

        const res: RequestResponse<CompanyType<UserType>[]> = await response.json()
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

        const res: RequestResponse<CompanyType<UserType>[]> = await response.json()
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
