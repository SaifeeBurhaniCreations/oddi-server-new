import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
type UploadMode = 'direct' | 'presignPut' | 'presignPost';
export type S3UploadOptions = {
    mode: UploadMode;
    bucket: string;
    region: string;
    credentials?: S3ClientConfig['credentials'];
    prefix?: (ctx: {
        mime: string;
    }) => string;
    allowedMime?: string[];
    maxSizeMB?: number;
    publicRead?: boolean;
    presignExpires?: number;
    presignMaxSizeMB?: number;
    dirName?: string;
};
export declare const createS3ImageUploader: (opts: S3UploadOptions) => {
    router: Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
    withS3: MiddlewareHandler;
    s3: S3Client;
};
export { S3Client };
//# sourceMappingURL=s3-image-uploader.d.ts.map