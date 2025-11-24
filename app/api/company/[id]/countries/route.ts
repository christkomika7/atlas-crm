import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const userId = getIdFromUrl(req.url, 2) as string;

    await checkAccess(["SETTING"], "MODIFY");

    const { currentCompany }: { currentCompany?: string } = await req.json();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            profiles: {
                include: { company: true }
            }
        }
    });

    if (!user) {
        return NextResponse.json(
            { state: "error", message: "Utilisateur introuvable." },
            { status: 404 }
        );
    }

    // --- ADMIN CAN SET ANY COMPANY WITHOUT CHECKING PROFILE ---
    if (currentCompany && user.role === "ADMIN") {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                currentCompany,
                currentProfile: null // admin n'utilise pas de profile
            }
        });
    }

    // --- NORMAL USER : CHECK PROFILE BEFORE UPDATE ---
    if (currentCompany && user.role !== "ADMIN") {
        const profile = await prisma.profile.findFirst({
            where: {
                userId: user.id,
                companyId: currentCompany
            }
        });

        if (!profile) {
            return NextResponse.json(
                { state: "error", message: "Ce user n'appartient pas à cette compagnie." },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                currentCompany,
                currentProfile: profile.id
            }
        });
    }

    // --- ADMIN : RETURN ALL COMPANIES ---
    if (user.role === "ADMIN") {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                companyName: true,
                country: true,
                currency: true,
            }
        });

        return NextResponse.json({
            state: "success",
            data: companies,
            message: ""
        });
    }

    // --- NORMAL USER : RETURN ONLY THEIR COMPANIES ---
    const companies = user.profiles.map((profile) => ({
        id: profile.companyId!,
        companyName: profile.company!.companyName,
        country: profile.company!.country,
        currency: profile.company!.currency,
    }));

    return NextResponse.json({
        state: "success",
        data: companies,
        message: ""
    });
}
