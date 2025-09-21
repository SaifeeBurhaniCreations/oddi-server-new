import { Hono } from 'hono';
import { S3Client, PutObjectCommand, HeadObjectCommand, } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
const defaultAllowed = ['image/jpeg', 'image/png', 'image/webp'];
const isAllowed = (mime, allowed) => allowed.includes(mime);
const sanitizeDir = (dir, fallback = "uploads") => (dir && typeof dir === "string" && dir.replace(/[^a-zA-Z0-9_\-/]/g, '').replace(/^\/+|\/+$/g, '')) || fallback;
const keyFor = (folder) => `${folder}/${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/${crypto.randomUUID()}`;
const toBytes = (mb) => (mb && mb > 0 ? mb * 1024 * 1024 : undefined);
export const createS3ImageUploader = (opts) => {
    const { mode, bucket, region, credentials, prefix, allowedMime = defaultAllowed, maxSizeMB = 10, publicRead = false, presignExpires = 900, presignMaxSizeMB = 20, dirName = "uploads", } = opts;
    const s3 = new S3Client({ region, credentials });
    const validateFile = (file) => {
        if (!isAllowed(file.type, allowedMime)) {
            return `Unsupported type ${file.type}`;
        }
        if (file.size > (toBytes(maxSizeMB) ?? Infinity)) {
            return `File too large (>${maxSizeMB}MB)`;
        }
        return null;
    };
    const router = new Hono();
    // Direct server upload (multipart/form-data)
    if (mode === 'direct') {
        router.post('/upload', async (c) => {
            const body = await c.req.parseBody();
            const file = body['file'];
            if (!(file instanceof File)) {
                return c.json({ error: 'Missing file' }, 400);
            }
            const error = validateFile(file);
            if (error)
                return c.json({ error }, 415);
            const userDir = sanitizeDir(body["dirName"], dirName);
            const mime = file.type || 'application/octet-stream';
            const folder = prefix ? prefix({ mime }) : userDir;
            const k = keyFor(folder);
            if (file.size > 5 * 1024 * 1024) {
                const webStream = file.stream();
                const nodeStream = Readable.fromWeb(webStream);
                const uploader = new Upload({
                    client: s3,
                    params: {
                        Bucket: bucket,
                        Key: k,
                        Body: nodeStream,
                        ContentType: mime,
                        ACL: publicRead ? 'public-read' : undefined,
                    },
                    queueSize: 4,
                    partSize: 5 * 1024 * 1024,
                    leavePartsOnError: false,
                });
                await uploader.done();
            }
            else {
                const buf = new Uint8Array(await file.arrayBuffer());
                await s3.send(new PutObjectCommand({
                    Bucket: bucket,
                    Key: k,
                    Body: buf,
                    ContentType: mime,
                    ACL: publicRead ? 'public-read' : undefined,
                }));
            }
            const objectUrl = `s3://${bucket}/${k}`;
            return c.json({ key: k, bucket, objectUrl });
        });
    }
    // Presigned PUT mode
    if (mode === 'presignPut') {
        router.post('/presign', async (c) => {
            const { contentType, dirName: reqDir } = await c.req.json().catch(() => ({}));
            const mime = typeof contentType === 'string' ? contentType : 'image/jpeg';
            if (!isAllowed(mime, allowedMime)) {
                return c.json({ error: `Unsupported type ${mime}` }, 415);
            }
            const userDir = sanitizeDir(reqDir, dirName);
            const folder = prefix ? prefix({ mime }) : userDir;
            const k = keyFor(folder);
            const url = await getSignedUrl(s3, new PutObjectCommand({
                Bucket: bucket,
                Key: k,
                ContentType: mime,
                ACL: publicRead ? 'public-read' : undefined,
            }), { expiresIn: presignExpires });
            return c.json({
                uploadUrl: url,
                key: k,
                headers: { 'Content-Type': mime },
                bucket,
                expiresIn: presignExpires,
            });
        });
        router.get('/verify/:key', async (c) => {
            const key = c.req.param('key');
            try {
                const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
                return c.json({ exists: true, contentType: head.ContentType, size: head.ContentLength });
            }
            catch {
                return c.json({ exists: false }, 404);
            }
        });
    }
    // Presigned POST mode
    if (mode === 'presignPost') {
        router.post('/presign', async (c) => {
            const { contentType, dirName: reqDir } = await c.req.json().catch(() => ({}));
            const mime = typeof contentType === 'string' ? contentType : 'image/jpeg';
            if (!isAllowed(mime, allowedMime)) {
                return c.json({ error: `Unsupported type ${mime}` }, 415);
            }
            const userDir = sanitizeDir(reqDir, dirName);
            const folder = prefix ? prefix({ mime }) : userDir;
            const k = keyFor(folder);
            const maxBytes = toBytes(presignMaxSizeMB) ?? 20 * 1024 * 1024;
            const { url, fields } = await createPresignedPost(s3, {
                Bucket: bucket,
                Key: k,
                Conditions: [['content-length-range', 0, maxBytes]],
                Fields: {
                    'Content-Type': mime,
                    ...(publicRead ? { acl: 'public-read' } : {}),
                },
                Expires: presignExpires,
            });
            return c.json({ url, fields, key: k, bucket, expiresIn: presignExpires, maxSizeMB: presignMaxSizeMB });
        });
    }
    const withS3 = async (c, next) => {
        c.set('s3', s3);
        await next();
    };
    return { router, withS3, s3 };
};
export { S3Client };
