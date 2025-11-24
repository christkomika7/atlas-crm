import { NextResponse, type NextRequest } from "next/server";
import { getIdFromUrl } from "@/lib/utils";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { createFile, createFolder, removePath } from "@/lib/file";
import path from "path";

export async function PUT(req: NextRequest) {
    await checkAccess(["SETTING"], "READ");

    const id = getIdFromUrl(req.url, 2) as string;

    const formData = await req.formData();

    const document = formData.get("document") as File;
    const state = formData.get("state") as "update" | "delete";
    const type = formData.get("type") as "doc" | "passport";

    const profile = await prisma.profile.findUnique({ where: { id } });

    if (!profile) {
        return NextResponse.json({
            state: "error",
            message: "Aucune donnée trouvée.",
        }, {
            status: 400
        })
    }

    let message = "";


    switch (type) {
        case "doc":
            switch (state) {
                case "update":
                    const folder = createFolder([`${profile.path}`, 'document']);
                    if (profile.internalRegulations) {
                        const [_, upload] = await Promise.all([
                            removePath(path.join(`${profile.path}`, 'document')),
                            createFile(document, folder, document.name),
                        ]);

                        await prisma.profile.update({
                            where: { id },
                            data: { internalRegulations: upload }
                        });
                        message = "Le document a été modifié avec succés."

                    } else {
                        const upload = await createFile(document, folder, document.name);
                        await prisma.profile.update({
                            where: { id },
                            data: { internalRegulations: upload }
                        });
                        message = 'Le document a été ajouté avec succès.'
                    }
                    break;

                case "delete":
                    await Promise.all([
                        removePath(path.join(`${profile.path}`, 'document')),
                        prisma.profile.update({
                            where: { id },
                            data: { internalRegulations: "" }
                        })
                    ]);
                    message = "Le document a été supprimé avec succés."

                    break;
            }
            break;
        case "passport":
            switch (state) {
                case "update":
                    const folder = createFolder([`${profile.path}`, 'passport']);
                    if (profile.passport) {
                        const [_, upload] = await Promise.all([
                            removePath(path.join(`${profile.path}`, 'passport')),
                            createFile(document, folder, document.name),
                        ]);

                        await prisma.profile.update({
                            where: { id },
                            data: { passport: upload }
                        });

                        message = "Le passport a été modifié avec succés."


                    } else {
                        const upload = await createFile(document, folder, document.name);
                        await prisma.profile.update({
                            where: { id },
                            data: { passport: upload }
                        });
                    }
                    message = "Le passport a été ajouté avec succés."

                    break;

                case "delete":
                    await Promise.all([
                        removePath(path.join(`${profile.path}`, 'passport')),
                        prisma.profile.update({
                            where: { id },
                            data: { passport: "" }
                        })
                    ]);
                    message = "Le document a été supprimé avec succés."

                    break;

            }
            break;
    }

    const updatedProfile = await prisma.profile.findUnique({ where: { id } });

    return NextResponse.json(
        {
            message: message,
            state: "success",
            data: updatedProfile,
        },
        { status: 200 }
    );

}
