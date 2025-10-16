import { checkAccess } from "@/lib/access";
import { parseDateTime } from "@/lib/date";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { projectSchema, ProjectSchemaType } from "@/lib/zod/project.schema";
import { generateId } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["PROJECTS"], "CREATE");

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
        prisma.project.findUnique({ where: { name: data.projectName } }),
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

