import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { parseDateTime } from "@/lib/date";
import { createFolder, moveTo, removePath, saveFile } from "@/lib/file";
import { $Enums, Prisma } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { editTaskSchema, EditTaskSchemaType } from "@/lib/zod/task.schema";
import { TaskType } from "@/types/task.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PROJECTS"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;

    const tasks = await prisma.task.findMany({
        where: {
            projectId: id,
        },
        include: {
            users: true,
            steps: true,
            project: {
                include: {
                    company: true,
                    collaborators: true

                }
            }
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: tasks,
        },
        { status: 200 }
    );
}

export async function PUT(req: NextRequest) {
    await checkAccess(["PROJECTS"], "MODIFY");

    const id = getIdFromUrl(req.url, "last") as string;

    const task = await checkData(prisma.task, { where: { id } }, "identifiant") as TaskType;

    const formData = await req.formData();

    const files: File[] = [];
    const data: EditTaskSchemaType = {
        id: formData.get("id") as string,
        projectId: formData.get("projectId") as string,
        taskName: formData.get("taskName") as string,
        description: formData.get("description") as string,
        comment: formData.get("comment") as string,
        priority: formData.get("priority") as string,
        status: formData.get("status") as string,
        users: JSON.parse(formData.get("users") as string),
        time: parseDateTime(formData.get("time") as string, 0, 0),
        lastUploadDocuments: JSON.parse(formData.get("lastUploadDocuments") as string)
    }

    formData.forEach((value, key) => {
        if (key === "uploadDocuments" && value instanceof File) {
            files.push(value)
        }
    });

    const parsedData = (parseData<EditTaskSchemaType>(editTaskSchema,
        { ...data, uploadDocuments: files })) as EditTaskSchemaType;

    const projectExist = await prisma.project.findUnique({
        where: { id: parsedData.projectId }, include: {
            company: true
        }
    });
    if (!projectExist) {
        console.log({ error: "Identifiant invalide." })
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const previousDocs = task.file ?? [];

    const key = task.path.split("_----")[1];
    const folder = createFolder([projectExist.company.companyName, "task", `${parsedData.taskName}_----${key}`]);

    const deletedDocs = previousDocs.filter(doc => !parsedData.lastUploadDocuments?.includes(doc));
    const updatedDocs = previousDocs.filter(doc => parsedData.lastUploadDocuments?.includes(doc))

    await removePath(deletedDocs);

    if ((parsedData.id === task.id) && (task.path !== folder)) {
        await moveTo(task.path, folder)
    }


    let savedPaths: string[] = [];

    // Mise a jour des anciens fichiers
    savedPaths = [...updatedDocs.map(doc => {
        const filename = doc.split("_----")[1];
        return createFolder([projectExist.company.companyName, "task", `${parsedData.taskName}_----${filename}`])
    })]

    // Sauvegarde des nouveaux fichiers
    for (const file of files) {
        const filePath = await saveFile(file, folder);
        savedPaths.push(filePath);
    }

    // 🛠 Construction dynamique de l’objet de mise à jour
    const updateData: Prisma.TaskUpdateInput = {
        taskName: parsedData.taskName,
        desc: parsedData.description ?? "",
        comment: parsedData.comment ?? "",
        time: parsedData.time,
        path: folder,
        priority: parsedData.priority as $Enums.Priority,
        status: parsedData.status as $Enums.ProjectStatus,
        file: [...savedPaths],
    };

    console.log({ updateData });

    try {
        const updatedAppointment = await prisma.task.update({
            where: { id: data.id },
            data: {
                ...updateData,
                users: {
                    connect: parsedData.users.map((id) => ({ id }))
                },
                project: {
                    connect: {
                        id: parsedData.projectId
                    }
                }
            },
            include: {
                users: true,
                steps: true,
                project: {
                    include: {
                        company: true,
                        collaborators: true

                    }
                }
            }
        });

        return NextResponse.json({
            status: "success",
            message: "Tâche modifiée avec succès.",
            data: updatedAppointment,
        });
    } catch (error) {
        await removePath(savedPaths);
        console.error({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification de la tâche.",
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["PROJECTS"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const task = await prisma.task.findUnique({
        where: { id },
    });

    if (!task) {
        return NextResponse.json({
            message: "Tâche introuvable.",
            state: "error",
        }, { status: 400 })
    }

    const deletedTask = await prisma.task.delete({ where: { id } });
    await removePath(task.file);
    return NextResponse.json({
        state: "success",
        data: deletedTask,
        message: "Tâche supprimée avec succès.",
    }, { status: 200 }
    )
}