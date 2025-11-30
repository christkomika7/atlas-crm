import { Action, Permission, Resource, Role } from "./generated/prisma";

interface AuthorizeParams {
  resource: Resource | Resource[];
  action: Action | Action[];
  role: Role;
  userPermissions: Permission[];
}

interface AuthorizeResponse {
  authorized: boolean;
  message: string;
}

function authorize({
  resource,
  action,
  role,
  userPermissions,
}: AuthorizeParams): AuthorizeResponse {
  if (!resource || !action || !role || !userPermissions) {
    return {
      authorized: false,
      message: "Paramètres manquants",
    };
  }

  if (!Array.isArray(userPermissions)) {
    return {
      authorized: false,
      message: "Les permissions doivent être un tableau",
    };
  }

  // ADMIN a accès à tout
  if (role === "ADMIN") {
    return {
      authorized: true,
      message: "Accès autorisé (admin)",
    };
  }

  const resources = Array.isArray(resource) ? resource : [resource];
  const actions = Array.isArray(action) ? action : [action];

  let hasAccess = false;
  const errorMessages: string[] = [];

  for (const res of resources) {
    const normalizedResource = res.toUpperCase();
    const permission = userPermissions.find(
      (p) => p.resource.toUpperCase() === normalizedResource,
    );

    if (!permission) {
      errorMessages.push(`Aucune permission pour la ressource ${res}`);
      continue;
    }

    let resourceHasAccess = true;

    for (const act of actions) {
      if (act === "READ") {
        const hasRead =
          permission.actions.includes("READ") ||
          permission.actions.includes("CREATE") ||
          permission.actions.includes("MODIFY");

        if (!hasRead) {
          resourceHasAccess = false;
          errorMessages.push(`Accès READ refusé pour la ressource ${res}`);
        }
      } else {
        if (!permission.actions.includes(act)) {
          resourceHasAccess = false;
          errorMessages.push(
            `Action ${act} non autorisée pour la ressource ${res}`,
          );
        }
      }
    }

    if (resourceHasAccess) {
      hasAccess = true;
    }
  }

  if (hasAccess) {
    return {
      authorized: true,
      message: "Accès autorisé",
    };
  }

  return {
    authorized: false,
    message: errorMessages.join(" | "),
  };
}

export { authorize, type AuthorizeParams, type AuthorizeResponse };
