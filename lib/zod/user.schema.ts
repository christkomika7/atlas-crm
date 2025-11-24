import { ACCEPTED_FILES_TYPES, ACCEPTED_IMAGE_TYPES, IMAGE_TYPES, MAX_FILE_SIZE } from "@/config/constant";
import { z } from "zod";
import { validateMimeType } from "../utils";

export const userSchema = z.object({
    image: z
        .instanceof(File, {
            message: "La valeur inserer n'est pas une image."
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        // .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as IMAGE_TYPES), {
        //     message: "Formats acceptés : .jpeg, .jpg, .png, .webp",
        // })
        .optional()
        .nullable(),
    lastname: z.string().min(1, {
        message: "Le nom de famille est obligatoire."
    }),
    firstname: z.string().min(1, {
        message: "Le prénom est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail est invalide."
    }),
    userId: z.string().optional(),
    phone: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    job: z.string().min(1, {
        message: "Le poste est obligatoire."
    }),
    salary: z.string({ error: "Le salaire est obligatoire." }),
    password: z.string().min(1, {
        message: "Le mot de passe est obligatoire."
    }),

    passport: z
        .instanceof(File, {
            message: "La valeur insérée n'est pas un fichier."
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        .refine((file) => validateMimeType(file, ACCEPTED_FILES_TYPES), {
            message: "Formats acceptés : .jpeg, .jpg, .png, .pdf, .doc, .docx",
        })
        .optional()
        .nullable(),
    document: z
        .instanceof(File, {
            message: "La valeur insérée n'est pas un fichier."
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        .refine((file) => validateMimeType(file, ACCEPTED_FILES_TYPES), {
            message: "Formats acceptés : .jpeg, .jpg, .png, .pdf, .doc, .docx",
        })
        .optional()
        .nullable(),

    dashboard: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    clients: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    suppliers: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    invoices: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    quotes: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    deliveryNotes: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    purchaseOrder: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    creditNotes: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    productServices: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    billboards: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    projects: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    appointment: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    contract: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    transaction: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    setting: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
});

export const userEditSchema = z.object({
    id: z.string().optional(),
    image: z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        // .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as IMAGE_TYPES), {
        //     message: "Formats acceptés : .jpeg, .jpg, .png, .webp",
        // })
        .optional()
        .nullable(),
    lastname: z.string().min(1, {
        message: "Le nom de famille est obligatoire."
    }),
    firstname: z.string().min(1, {
        message: "Le prénom est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail est invalide."
    }),
    phone: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    job: z.string().min(1, {
        message: "Le poste est obligatoire."
    }),
    salary: z.string({ error: "Le salaire est obligatoire." }),
    password: z.string().optional(),
    newPassword: z.string().optional(),

    passport: z
        .instanceof(File, {
            message: "La valeur insérée n'est pas un fichier."
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        .refine((file) => validateMimeType(file, ACCEPTED_FILES_TYPES), {
            message: "Formats acceptés : .jpeg, .jpg, .png, .pdf, .doc, .docx",
        })
        .optional()
        .nullable(),
    document: z
        .instanceof(File, {
            message: "La valeur insérée n'est pas un fichier."
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        .refine((file) => validateMimeType(file, ACCEPTED_FILES_TYPES), {
            message: "Formats acceptés : .jpeg, .jpg, .png, .pdf, .doc, .docx",
        })
        .optional()
        .nullable(),


    dashboard: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    clients: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    suppliers: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    invoices: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    quotes: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    deliveryNotes: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    purchaseOrder: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    creditNotes: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    productServices: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    billboards: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    projects: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    appointment: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    contract: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    transaction: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
    setting: z.object({
        create: z.boolean(),
        edit: z.boolean(),
        read: z.boolean(),
    }).optional(),
}).refine(
    (data) => {
        if (data.password && !data.newPassword) return false;
        return true;
    },
    {
        message: "Le nouveau mot de passe est obligatoire lorsque l'ancien mot de passe est renseigné.",
        path: ["newPassword"],
    }
);

export const userIdSchema = z.string()

export const userProfilSchema = z.object({
    id: userIdSchema,
    image: z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `Le fichier doit être inférieur à ${MAX_FILE_SIZE} octets`,
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as IMAGE_TYPES), {
            message: "Formats acceptés : .jpeg, .jpg, .png, .webp",
        })
        .optional(),
})

export type UserSchemaType = z.infer<typeof userSchema>;
export type UserEditSchemaType = z.infer<typeof userEditSchema>;
export type UserProfilSchema = z.infer<typeof userProfilSchema>;