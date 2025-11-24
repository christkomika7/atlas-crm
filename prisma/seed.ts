import { auth } from "@/lib/auth";
import { Action, Resource, Role } from "@/lib/generated/prisma";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function main() {
  const email = process.env.USER_EMAIL!;
  const firstName = process.env.USER_FIRSTNAME!;
  const lastName = process.env.USER_LASTNAME!;
  const password = process.env.USER_PASSWORD!;

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      profiles: true,
    },
  });

  if (existingUser) {
    console.log("L'utilisateur existe déjà. Vérification des profils...");
    if (!existingUser.profiles || existingUser.profiles.length === 0) {
      const path = `${crypto.randomUUID()}_${firstName}_${lastName}`.toLowerCase();
      const profile = await prisma.profile.create({
        data: {
          user: { connect: { id: existingUser.id } },
          firstname: firstName,
          lastname: lastName,
          path,
          phone: "",
          job: "",
          salary: "",
          permissions: {
            createMany: {
              data: Object.values(Resource).flatMap((resource) => {
                return [
                  {
                    resource: resource as Resource,
                    actions: [Action.READ, Action.CREATE, Action.MODIFY],
                  },
                ];
              }),
            },
          },
        },
      });
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { currentProfile: profile.id },
      });
      return console.log("Profil ajouté à l'utilisateur existant.");
    }
    return console.log("Seed déjà réalisé auparavant.");
  }

  // Si l'utilisateur n'existe pas
  const username = `${firstName} ${lastName}`;
  const path = `${crypto.randomUUID()}_${firstName}_${lastName}`.toLowerCase();

  const response = await auth.api.signUpEmail({
    body: {
      name: username,
      email,
      password,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  if (!response.user) {
    return console.log("Erreur lors de la création de l'utilisateur.");
  }

  const profile = await prisma.profile.create({
    data: {
      user: { connect: { id: response.user.id } },
      firstname: firstName,
      lastname: lastName,
      path,
      phone: "",
      job: "",
      salary: "",
      permissions: {
        createMany: {
          data: Object.values(Resource).flatMap((resource) => {
            return [
              {
                resource: resource as Resource,
                actions: [Action.READ, Action.CREATE, Action.MODIFY],
              },
            ];
          }),
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: response.user.id },
    data: { currentProfile: profile.id },
  });

  console.log("Le seed a été réalisé avec succès.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
