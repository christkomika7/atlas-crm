import { startCrons } from "@/lib/cron";

let cronsStarted = false;

if (!cronsStarted) {
    startCrons();
    cronsStarted = true;
    console.log("✅ Cron jobs démarrés");
}

export async function GET() {
    return Response.json({ ok: true });
}
