import prisma from "@/lib/prisma";
import { createFolder, moveTo, removePath, saveFile } from "@/lib/file";
import { getIdFromUrl } from "@/lib/utils";
import { editClientSchema, EditClientSchemaType } from "@/lib/zod/client.schema";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@/lib/generated/prisma";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { checkData } from "@/lib/database";
import { ClientType } from "@/types/client.types";

export async function PUT(req: NextRequest) {
    await checkAccess(["CLIENTS"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;
    const client = await checkData(prisma.client, { where: { id }, include: { company: true } }, "identifiant") as ClientType;

    const formData = await req.formData();
    const rawData: Record<string, string> = {};
    const files: File[] = [];

    formData.forEach((value, key) => {
        if (key === "uploadDocuments" && value instanceof File) {
            files.push(value);
        } else {
            rawData[key] = value as string;
        }
    });

    const data = parseData<EditClientSchemaType>(editClientSchema, {
        ...rawData as unknown as EditClientSchemaType,
        lastUploadDocuments: rawData.lastUploadDocuments?.split(";") ?? [],
        uploadDocuments: files
    }) as EditClientSchemaType;

    const previousDocs = client.uploadDocuments ?? [];

    const folder = createFolder([client.company.companyName, "client", `${data.firstname}_${data.lastname}`]);

    const deletedDocs = previousDocs.filter(doc => !data.lastUploadDocuments?.includes(doc));
    await removePath(deletedDocs);

    if (client.path && (folder !== client.path)) {
        await moveTo(client.path, folder)
    }


    const savedPaths: string[] = [];

    for (const file of files) {
        const filePath = await saveFile(file, folder);
        savedPaths.push(filePath);
    }

    const updateData: Prisma.ClientUpdateInput = {
        companyName: data.companyName,
        lastname: data.lastname,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        website: data.website,
        capital: data.capital,
        job: data.job,
        legalForms: data.legalForms,
        path: folder,
        address: data.address,
        businessSector: data.businessSector,
        businessRegistrationNumber: data.businessRegistrationNumber,
        taxIdentificationNumber: data.taxIdentificationNumber,
        discount: data.discount,
        paymentTerms: data.paymentTerms,
        information: data.information,
        uploadDocuments: [...savedPaths, ...(data.lastUploadDocuments ?? [])],
    };

    try {
        const updatedClient = await prisma.client.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            status: "success",
            message: "Client modifié avec succès.",
            data: updatedClient,
        });
    } catch (error) {
        await removePath(savedPaths);
        console.error({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification du client.",
        }, { status: 500 });
    }
}
