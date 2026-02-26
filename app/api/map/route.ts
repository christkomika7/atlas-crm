import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const finalUrl = response.url;

        let coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (coordMatch) {
            return NextResponse.json({
                coordinates: `${coordMatch[1]},${coordMatch[2]}`,
                fullUrl: finalUrl
            });
        }

        let placeMatch = finalUrl.match(/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (placeMatch) {
            return NextResponse.json({
                coordinates: `${placeMatch[1]},${placeMatch[2]}`,
                fullUrl: finalUrl
            });
        }

        let searchMatch = finalUrl.match(/search\/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/);

        if (searchMatch) {
            return NextResponse.json({
                coordinates: `${searchMatch[1]},${searchMatch[2]}`,
                fullUrl: finalUrl
            });
        }

        const urlObj = new URL(finalUrl);
        const qParam = urlObj.searchParams.get('q');

        if (qParam) {
            const qMatch = qParam.match(/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/);
            if (qMatch) {
                console.log({
                    coordinates: `${qMatch[1]},${qMatch[2]}`,
                    fullUrl: finalUrl
                })
                return NextResponse.json({
                    coordinates: `${qMatch[1]},${qMatch[2]}`,
                    fullUrl: finalUrl
                }, { status: 200 });
            }
        }

        return NextResponse.json({
            error: "Coordonnées non trouvées",
            finalUrl: finalUrl,
            debug: "Aucun pattern ne correspond"
        }, { status: 404 });

    } catch (error) {
        console.error('Erreur résolution URL:', error);
        return NextResponse.json({ error: "Erreur lors de la résolution" }, { status: 500 });
    }
}