import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", request.nextUrl.pathname);

    return response;
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
