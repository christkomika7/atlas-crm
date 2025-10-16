import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { checkAccess } from '@/lib/access';
import { checkIfExists } from '@/lib/database';

export async function POST(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "MODIFY")

    try {
        const { email, id } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ message: "Email invalide." }, { status: 400 });
        }

        if (email && !id) {
            checkIfExists(prisma.user, { where: { email } }, "adresse mail", email)
            return NextResponse.json({ state: "success" }, { status: 200 });
        }
        return NextResponse.json({ state: "success" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Erreur lors du traitement de la requête." }, { status: 500 });
    }
}