import { z } from "zod";

export const appointmentSchema = z.object({
    client: z.string().min(1, {
        message: "Le client est requis.",
    }),
    company: z.string().min(1, {
        message: "Aucune entreprise trouvé.",
    }),
    email: z
        .string()
        .trim()
        .min(1, {
            message: "L'adresse e-mail est requise.",
        })
        .email({
            message: "L'adresse e-mail n'est pas valide.",
        }),
    date: z.date().refine(
        (val) => val instanceof Date && !isNaN(val.getTime()),
        {
            message: "La date du rendez-vous est invalide.",
        }
    ),
    time: z.string().min(1, {
        message: "L'heure du rendez-vous est requise.",
    }),
    subject: z.string().min(1, {
        message: "L'objet du rendez-vous est requis.",
    }),
    address: z.string().min(1, {
        message: "L'adresse du rendez-vous est requise.",
    }),
    notify: z.boolean(),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
});


export const editAppointmentSchema = z.object({
    id: z.string().min(1, { message: "Id obligatoire." }),
    client: z.string().min(1, {
        message: "Le client est requis.",
    }),
    company: z.string().min(1, {
        message: "Aucune entreprise trouvé.",
    }),
    email: z
        .string()
        .trim()
        .min(1, {
            message: "L'adresse e-mail est requise.",
        })
        .email({
            message: "L'adresse e-mail n'est pas valide.",
        }),
    date: z.date().refine(
        (val) => val instanceof Date && !isNaN(val.getTime()),
        {
            message: "La date du rendez-vous est invalide.",
        }
    ),
    time: z.string().min(1, {
        message: "L'heure du rendez-vous est requise.",
    }),
    subject: z.string().min(1, {
        message: "L'objet du rendez-vous est requis.",
    }),
    address: z.string().min(1, {
        message: "L'adresse du rendez-vous est requise.",
    }),
    notify: z.boolean().optional(),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
    lastUploadDocuments: z.array(z.string()).optional()
});

export type AppointmentSchemaType = z.infer<typeof appointmentSchema>;
export type EditAppointmentSchemaType = z.infer<typeof editAppointmentSchema>;