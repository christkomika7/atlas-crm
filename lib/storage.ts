import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import pRetry from "p-retry";
import pLimit from "p-limit";

const limit = pLimit(5);

export const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION ?? "auto",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
    requestHandler: {
        connectionTimeout: 30000,
        requestTimeout: 300000,
    },
});

const BUCKET = process.env.S3_BUCKET!;


function uploadWithRetry(uploadFn: () => Promise<string>) {
    return limit(() =>
        pRetry(uploadFn, {
            retries: 3,
            minTimeout: 500,
            maxTimeout: 2000,
            onFailedAttempt: (error) => {
                console.warn(`Tentative ${error.attemptNumber} échouée, retry...`);
            },
        })
    );
}

export async function uploadFile(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string
) {

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
    }));

    return { key };
}

export function uploadFiles(uploadedKeys: string[], files?: File[]) {
    if (!files) return [];

    return Promise.all(
        files.map((file) =>
            uploadWithRetry(async () => {
                const buffer = new Uint8Array(await file.arrayBuffer());
                const extension = file.name.split('.').pop();
                const key = `${randomUUID()}.${extension}`;

                await uploadFile(key, buffer, file.type);
                uploadedKeys.push(key);

                return key;
            })
        )
    );
}

export async function uploadFileSingle(
    uploadedKeys: string[],
    file?: File
): Promise<string | null> {
    if (!file) return null;

    return uploadWithRetry(async () => {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const extension = file.name.split(".").pop();
        const key = `${crypto.randomUUID()}.${extension}`;

        await uploadFile(key, buffer, file.type);
        uploadedKeys.push(key);

        return key;
    });
}

export async function deleteFile(key: string) {
    await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    }));
}

export async function getSignedFileUrl(key: string) {
    const PUBLIC_DOMAIN = process.env.S3_PUBLIC_DOMAIN!;
    return `https://${PUBLIC_DOMAIN}/${key}`;
}