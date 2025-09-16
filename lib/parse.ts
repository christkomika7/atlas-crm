import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

export function parseData<T>(schema: ZodSchema<T>, data: T) {
    const validation = schema.safeParse(data);
    console.log({ validation: validation.error });
    if (!validation.success) {
        return NextResponse.json(
            {
                message: "Données invalides.",
                errors: validation.error.flatten().fieldErrors,
                state: "error",
            },
            { status: 400 })
    }

    return validation.data
}