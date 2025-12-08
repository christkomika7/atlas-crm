import { checkAccess } from "@/lib/access";
import { parseDateTime } from "@/lib/date";
import { createFile, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { getFirstValidCompanyId } from "@/lib/utils";
import { projectSchema, ProjectSchemaType } from "@/lib/zod/project.schema";
import { generateId } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("PROJECTS", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];

    formData.forEach((value, key) => {
        if (key === "uploadDocuments" && value instanceof File) {
            files.push(value);
        } else {
            rawData[key] = value as string;
        }
    });
    const date = parseDateTime(rawData.deadline as string, 0, 0);

    const data = parseData<ProjectSchemaType>(projectSchema, {
        ...rawData,
        deadline: date,
        collaborators: rawData.collaborators.split(";").filter(Boolean),
        uploadDocuments: files,
    }) as ProjectSchemaType;

    const [companyExist, clientExist, projectExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.company } }),
        prisma.client.findUnique({ where: { id: data.client } }),
        prisma.project.findFirst({ where: { name: data.projectName, companyId: data.company } }),
    ]);

    if (!companyExist || !clientExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    if (projectExist) {
        return NextResponse.json({
            status: "error",
            message: "Un projet portant ce nom existe déjà.",
        }, { status: 400 });
    }

    const key = generateId();
    const folder = createFolder([companyExist.companyName, "project", `${data.projectName}_----${key}`]);
    let savedPaths: string[] = [];

    try {
        for (const file of files) {
            const upload = await createFile(file, folder);
            savedPaths = [...savedPaths, upload]
        }

        const createdProject = await prisma.project.create({
            data: {
                name: data.projectName,
                deadline: data.deadline,
                path: folder,
                projectInformation: data.projectInfo,
                files: savedPaths,
                client: {
                    connect: {
                        id: data.client
                    }
                },
                company: {
                    connect: {
                        id: data.company
                    }
                },
                collaborators: {
                    connect: data.collaborators.map((collaborator) => ({ id: collaborator }))
                },

            },
        });

        return NextResponse.json({
            status: "success",
            message: "Projet ajouté avec succès.",
            data: createdProject,
        });

    } catch (error) {
        await removePath(savedPaths)

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout du projet.",
        }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    const result = await checkAccess("PROJECTS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const projects = await prisma.project.findMany({
        where: { id: { in: ids } },
        include: {
            company: true,
            quotes: true,
            invoices: true,
            deliveryNotes: true,
            purchaseOrders: true,
            dibursements: true,
            tasks: true,
        }
    });

    const companyId = getFirstValidCompanyId(projects);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.PROJECTS, ids, companyId);

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
    }

    for (const project of projects) {
        if (
            project.invoices.length > 0 ||
            project.quotes.length > 0 ||
            project.purchaseOrders.length > 0 ||
            project.deliveryNotes.length > 0 ||
            project.dibursements.length > 0 ||
            project.tasks.length > 0
        ) {
            return NextResponse.json({
                state: "error",
                message: "Supprimez d'abord les transactions, factures, devis, bon de livraisons, bon de commandes et tâches associés à ce projet.",
            }, { status: 409 });
        }
    }

    await prisma.project.deleteMany({
        where: {
            id: { in: ids }
        },
    })


    projects.map(async project => {
        await removePath(project.files)
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les projets sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}