import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().min(1, { message: "L'email est obligatoire." }).email({ message: "L'email doit être valide." }),
    password: z.string().min(1, { message: "Le mot de passe est obligatoire" })
});

export type SignInSchemaType = z.infer<typeof signInSchema>;