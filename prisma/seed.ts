import { auth } from "@/lib/auth";
import { Action, Resource, Role } from "@/lib/generated/prisma";
import crypto from 'crypto';
import prisma from "@/lib/prisma";

export async function main() {
  const existingUser = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      email: process.env.USER_EMAIL!,
    },
    include: {
      profiles: true
    }
  });

  if (
    existingUser &&
    existingUser.email !== process.env.USER_EMAIL! &&
    existingUser.emailVerified
  ) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        email: process.env.USER_EMAIL!,
      },
    });
    return console.log("Le seed à été modifié avec succès.");
  }

  if (!existingUser) {
    const username = `${process.env.USER_FIRSTNAME!} ${process.env.USER_LASTNAME!}`
    const path = `${crypto.randomUUID()}_${process.env.USER_FIRSTNAME!}_${process.env.USER_LASTNAME!}`.toLowerCase();

    const response = await auth.api.signUpEmail({
      body: {
        name: username,
        email: process.env.USER_EMAIL!,
        password: process.env.USER_PASSWORD!,
        role: Role.ADMIN,
        emailVerified: true,
      },
    });
    if (response.user) {
      const profile = await prisma.profile.create({
        data: {
          user: { connect: { id: response.user.id } },
          firstname: process.env.USER_FIRSTNAME!,
          lastname: process.env.USER_LASTNAME!,
          path,
          phone: "",
          job: "",
          salary: "",
          permissions: {
            createMany: {
              data: [
                {
                  resource: Resource.DASHBOARD,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.CLIENTS,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.SUPPLIERS,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.INVOICES,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.QUOTES,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.DELIVERY_NOTES,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.PURCHASE_ORDER,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.CREDIT_NOTES,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.PRODUCT_SERVICES,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.BILLBOARDS,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.PROJECTS,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.APPOINTMENT,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.CONTRACT,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.TRANSACTION,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
                {
                  resource: Resource.SETTING,
                  actions: [
                    Action.READ,
                    Action.MODIFY,
                    Action.CREATE
                  ]
                },
              ]
            }
          }
        }
      })
      await prisma.user.update({
        where: { id: response.user.id },
        data: {
          currentProfile: profile.id
        }
      })
      return console.log("Le seed à été réalisé avec succès.");
    }
    console.log("Erreur lors de la réalisation du seed.");
  }
  return console.log("Seed déjà réalisé auparavant");
}
main();
