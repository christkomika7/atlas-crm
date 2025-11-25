import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { parseDateTime } from "@/lib/date";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums, Prisma } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { getIdFromUrl } from "@/lib/utils";
import { editProjectSchema, EditProjectSchemaType } from "@/lib/zod/project.schema";
import { ProjectType } from "@/types/project.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("PROJECTS", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    const projects = await prisma.project.findUnique({
        where: {
            id,
        },
        include: {
            company: true,
            client: true,
            collaborators: true,
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: projects,
        },
        { status: 200 }
    );
}

export async function PUT(req: NextRequest) {
    const result = await checkAccess("PROJECTS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    const project = await checkData(prisma.project, { where: { id } }, "identifiant") as ProjectType;

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

    const data = parseData<EditProjectSchemaType>(editProjectSchema, {
        ...rawData,
        deadline: date,
        lastUploadDocuments: JSON.parse(rawData.lastUploadDocuments),
        collaborators: JSON.parse(rawData.collaborators),
        uploadDocuments: files,
    }) as EditProjectSchemaType;

    const [companyExist, clientExist, projectExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.company } }),
        prisma.client.findUnique({ where: { id: data.client } }),
        prisma.project.findUnique({ where: { name: data.projectName } }),
    ]);

    if (!companyExist || !clientExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    if (projectExist && data.id !== projectExist.id) {
        return NextResponse.json({
            status: "error",
            message: "Un projet portant ce nom existe déjà.",
        }, { status: 400 });
    }

    const key = project.path.split("_----")[1];
    const folder = createFolder([companyExist.companyName, "project", `${data.projectName}_----${key}`]);

    const savedPaths = await updateFiles({ folder, outdatedData: project, updatedData: data, files })

    // 🛠 Construction dynamique de l’objet de mise à jour
    const updateData: Prisma.ProjectUpdateInput = {
        name: data.projectName,
        deadline: data.deadline,
        path: folder,
        projectInformation: data.projectInfo ?? "",
        files: savedPaths,
    };

    try {
        const updatedProject = await prisma.project.update({
            where: { id: data.id },
            data: {
                ...updateData,
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
            }
        });

        return NextResponse.json({
            status: "success",
            message: "Projet modifié avec succès.",
            data: updatedProject,
        });
    } catch (error) {
        await removePath(savedPaths);
        console.error({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification du projet.",
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("PROJECTS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            tasks: true,
            company: true
        }
    });

    if (!project) {
        return NextResponse.json({
            message: "Projet introuvable.",
            state: "error",
        }, { status: 400 })
    }

    await checkAccessDeletion($Enums.DeletionType.PROJECTS, [id], project.company.id)

    const deletedProject = await prisma.project.delete({ where: { id } });

    const paths = project.tasks
        .map(p => p.path)
        .filter(Boolean);
    await removePath([...project.files, ...paths]);
    return NextResponse.json({
        state: "success",
        data: deletedProject,
        message: "Projet supprimé avec succès.",
    }, { status: 200 }
    )
}