import { checkAccess } from "@/lib/access";
import { parseDateTime } from "@/lib/date";
import { createFile, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { taskSchema, TaskSchemaType } from "@/lib/zod/task.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess(["PROJECTS"], ["MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.formData();

    const files: File[] = [];
    const data: TaskSchemaType = {
        projectId: formData.get("projectId") as string,
        taskName: formData.get("taskName") as string,
        description: formData.get("description") as string,
        comment: formData.get("comment") as string,
        priority: formData.get("priority") as string,
        status: formData.get("status") as string,
        users: JSON.parse(formData.get("users") as string),
        time: parseDateTime(formData.get("time") as string, 0, 0),
    }

    formData.forEach((value, key) => {
        if (key === "uploadDocuments" && value instanceof File) {
            files.push(value)
        }
    });

    const parsedData: TaskSchemaType = (parseData<TaskSchemaType>(taskSchema,
        { ...data, uploadDocuments: files })) as TaskSchemaType;


    const projectExist = await prisma.project.findUnique({
        where: { id: parsedData.projectId }, include: {
            company: true
        }
    });
    if (!projectExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const key = generateId();
    const folder = createFolder([projectExist.company.companyName, "task", `${parsedData.taskName}_----${key}`]);
    let savedPaths: string[] = [];

    try {
        for (const file of files) {
            const upload = await createFile(file, folder);
            savedPaths = [...savedPaths, upload]
        }

        const createTask = await prisma.task.create({
            data: {
                taskName: parsedData.taskName,
                desc: parsedData.description ?? "",
                comment: parsedData.comment ?? "",
                time: parsedData.time,
                path: folder,
                priority: parsedData.priority as $Enums.Priority,
                status: parsedData.status as $Enums.ProjectStatus,
                file: savedPaths,
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
            message: "Tâche créée avec succès.",
            data: createTask,
        });
    }
    catch (error) {
        await removePath(savedPaths)
        console.log({ error })

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de la tâche.",
        }, { status: 500 });
    }
}