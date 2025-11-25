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

  // Normalisation en tableau
  const resources = Array.isArray(resource) ? resource : [resource];
  const actions = Array.isArray(action) ? action : [action];

  // Vérification pour chaque combinaison ressource/action
  for (const res of resources) {
    const normalizedResource = res.toUpperCase();

    const permission = userPermissions.find(
      (p) => p.resource.toUpperCase() === normalizedResource
    );

    if (!permission) {
      return {
        authorized: false,
        message: `Accès refusé : aucune permission pour la ressource ${res}`,
      };
    }

    for (const act of actions) {
      // RÈGLE READ → hérité de CREATE ou MODIFY
      if (act === "READ") {
        const hasRead =
          permission.actions.includes("READ") ||
          permission.actions.includes("CREATE") ||
          permission.actions.includes("MODIFY");

        if (!hasRead) {
          return {
            authorized: false,
            message: `Accès READ refusé pour la ressource ${res}`,
          };
        }
      } else {
        // CREATE ou MODIFY → vérification classique
        if (!permission.actions.includes(act)) {
          return {
            authorized: false,
            message: `Accès refusé : action ${act} non autorisée pour ${res}`,
          };
        }
      }
    }
  }

  return {
    authorized: true,
    message: "Accès autorisé",
  };
}



export { authorize, type AuthorizeParams, type AuthorizeResponse };