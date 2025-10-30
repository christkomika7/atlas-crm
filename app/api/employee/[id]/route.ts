import { auth } from "@/lib/auth";
import { Action, Prisma, Resource } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { removePath } from "@/lib/file";
import { userEditSchema, UserEditSchemaType } from "@/lib/zod/user.schema";
import { NextResponse, type NextRequest } from "next/server";
import { getIdFromUrl } from "@/lib/utils";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";

export async function GET(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "READ");

    const id = getIdFromUrl(req.url, "last") as string;

    const employee = await prisma.user.findUnique({
        where: { id },
        include: {
            profile: true,
            permissions: true,
        }
    });

    return NextResponse.json({
        state: "success",
        data: employee,
        message: "",
    }, { status: 200 })
}

export async function PUT(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const formData: UserEditSchemaType = await req.json();
    const data = parseData<UserEditSchemaType>(userEditSchema, formData) as UserEditSchemaType

    const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { profile: true, permissions: true },
    });

    if (!existingUser) {
        await removePath(data.path);
        return NextResponse.json(
            { message: `Identifiant inexistant.`, state: "error" },
            { status: 401 }
        );
    }

    const existingEmailUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingEmailUser && existingEmailUser.id !== id) {
        await removePath(data.path);
        return NextResponse.json(
            { message: `Cette adresse mail est déjà prise.`, state: "error" },
            { status: 409 }
        );
    }

    try {
        const ctx = await auth.$context;
        const hash = data.password ? await ctx.password.hash(data.password) : null;

        const result = await prisma.$transaction(async (tx) => {
            const employee = await tx.user.update({
                where: { id },
                data: {
                    name: `${data.firstname} ${data.lastname}`,
                    email: data.email,
                    profile: {
                        update: {
                            where: { userId: id },
                            data: { lastname: data.lastname, firstname: data.firstname, phone: data.phone, job: data.job, salary: data.salary },
                        },
                    },
                },
            });

            if (hash) {
                await tx.account.updateMany({
                    where: { userId: id },
                    data: { password: hash },
                });
            }

            await tx.permission.deleteMany({ where: { userId: id } });

            const toPermissions = (resource: Resource, obj?: any): Prisma.PermissionCreateManyInput | null => {
                const actions: Action[] = [];
                if (obj?.read) actions.push(Action.READ);
                if (obj?.edit) actions.push(Action.MODIFY);
                if (obj?.create) actions.push(Action.CREATE);
                return actions.length
                    ? { userId: id, resource, actions }
                    : null;
            };

            const permissions: Prisma.PermissionCreateManyInput[] = [
                toPermissions(Resource.DASHBOARD, data.dashboard),
                toPermissions(Resource.CLIENTS, data.clients),
                toPermissions(Resource.SUPPLIERS, data.suppliers),
                toPermissions(Resource.INVOICES, data.invoices),
                toPermissions(Resource.QUOTES, data.quotes),
                toPermissions(Resource.DELIVERY_NOTES, data.deliveryNotes),
                toPermissions(Resource.PURCHASE_ORDER, data.purchaseOrder),
                toPermissions(Resource.CREDIT_NOTES, data.creditNotes),
                toPermissions(Resource.PRODUCT_SERVICES, data.productServices),
                toPermissions(Resource.BILLBOARDS, data.billboards),
                toPermissions(Resource.PROJECTS, data.projects),
                toPermissions(Resource.APPOINTMENT, data.appointment),
                toPermissions(Resource.CONTRACT, data.contract),
                toPermissions(Resource.TRANSACTION, data.transaction),
                toPermissions(Resource.SETTING, data.setting),
            ].filter(Boolean) as Prisma.PermissionCreateManyInput[];

            if (permissions.length > 0) {
                await tx.permission.createMany({ data: permissions });
            }

            return employee;
        });

        if (data.path && existingUser.image) await removePath(existingUser.image);

        return NextResponse.json({
            message: "Employé mis à jour avec succès.",
            data: result,
            state: "success",
        });
    } catch (error) {
        console.log({ error });
        await removePath(data.path);
        return NextResponse.json({
            message: "Une erreur est survenue.",
            state: "error",
            error,
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;
    const employee = await prisma.user.findUnique({
        where: { id },
        include: {
            profile: true
        }
    });

    if (!employee) {
        return NextResponse.json({
            message: "Employé introuvable.",
            state: "error",
        }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } });
    await removePath([employee.image, employee.profile?.passport, employee.profile?.internalRegulations]);
    return NextResponse.json({
        state: "success",
        message: "Employé supprimé avec succès.",
    }, { status: 200 })
}