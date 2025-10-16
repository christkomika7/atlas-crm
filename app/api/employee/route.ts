import { Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { removePath } from "@/lib/file";
import { userSchema, UserSchemaType } from "@/lib/zod/user.schema";
import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { checkIfExists, createUser } from "@/lib/database";
import { User } from "better-auth";
import { createPermissionsData } from "@/lib/utils";
import { Decimal } from "decimal.js";

export async function POST(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "CREATE");

    const formData: UserSchemaType = await req.json();

    const data = parseData<UserSchemaType>(userSchema, formData) as UserSchemaType

    await checkIfExists(prisma.user, { where: { email: data.email } }, "adresse mail", data.email, [data.path?.split(";")[1] ?? ""]);

    const user = await createUser({
        name: `${data.firstname} ${data.lastname}`,
        role: Role.USER,
        email: data.email,
        password: data.password,
    }) as User

    if (user) {
        try {
            const employee = await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: data.path?.split(";")[1],
                    path: data.path?.split(";")[0],
                    profile: {
                        create: {
                            firstname: data.firstname,
                            lastname: data.lastname,
                            phone: data.phone,
                            job: data.job,
                            salary: data.salary,
                        }
                    },
                    permissions: {
                        createMany: {
                            data: createPermissionsData(data)
                        }
                    }
                }
            });
            return NextResponse.json({
                message: "Employé a été ajouté avec succès.",
                data: employee,
                state: "success",

            }, { status: 200 })
        } catch (error) {
            console.log({ error })
            await removePath(data.path)
            return NextResponse.json({
                message: error,
                state: "error",
            }, {
                status: 500
            })
        }
    }
}