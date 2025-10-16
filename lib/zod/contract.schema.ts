import { z } from "zod";

export const contractSchema = z.object({
    range: z.object({
        from: z.date(),
        to: z.date(),
    }).refine(
        (data) => new Date(data.from) <= new Date(data.to),
        { message: "La date de début doit être antérieure à la date de fin.", path: ["end"] }
    ),
    billboardType: z.string().min(1, { message: "Le type de panneau est requis" }),
    city: z.string().min(1, { error: "La ville est requise." }),
    area: z.array(z.string()).min(1, { message: "Au minimum une zone doit etre séléctionné." }),
});


export type ContractSchemaType = z.infer<typeof contractSchema>;