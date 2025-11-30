import prisma from "@/lib/prisma";
import { createFolder, moveTo, removePath, saveFile } from "@/lib/file";
import { getIdFromUrl } from "@/lib/utils";
import { editSupplierSchema, EditSupplierSchemaType } from "@/lib/zod/supplier.schema";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@/lib/generated/prisma";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { checkData } from "@/lib/database";
import { SupplierType } from "@/types/supplier.types";

export async function PUT(req: NextRequest) {
    const result = await checkAccess("SUPPLIERS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;
    const supplier = await checkData(prisma.supplier, { where: { id }, include: { company: true } }, "identifiant") as SupplierType;

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

    const data = parseData<EditSupplierSchemaType>(editSupplierSchema, {
        ...rawData as unknown as EditSupplierSchemaType,
        lastUploadDocuments: rawData.lastUploadDocuments?.split(";") ?? [],
        uploadDocuments: files
    }) as EditSupplierSchemaType;

    const previousDocs = supplier.uploadDocuments ?? [];

    const folder = createFolder([supplier.company.companyName, "supplier", `${data.firstname}_${data.lastname}`]);

    // Suppression des fichiers supprimés par l'utilisateur
    const deletedDocs = previousDocs.filter(doc => !data.lastUploadDocuments?.includes(doc));
    await removePath(deletedDocs);

    if (supplier.path && (folder !== supplier.path)) {
        await moveTo(supplier.path, folder)
    }

    const savedPaths: string[] = [];

    // Sauvegarde des nouveaux fichiers
    for (const file of files) {
        const filePath = await saveFile(file, folder);
        savedPaths.push(filePath);
    }

    // 🛠 Construction dynamique de l’objet de mise à jour
    const updateData: Prisma.SupplierUpdateInput = {
        companyName: data.companyName,
        lastname: data.lastname,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        website: data.website,
        capital: data.capital,
        path: folder,
        job: data.job,
        legalForms: data.legalForms,
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
        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            status: "success",
            message: "Fournisseur modifié avec succès.",
            data: updatedSupplier,
        });
    } catch (error) {
        await removePath(savedPaths);
        console.error({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification du fournisseur.",
        }, { status: 500 });
    }
}
