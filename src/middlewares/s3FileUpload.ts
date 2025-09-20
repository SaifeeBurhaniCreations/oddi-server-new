import { env } from "../config/env.js";
import { createS3ImageUploader } from "../sbc/utils/s3-image-uploader/s3-image-uploader.js";

export const uploader = createS3ImageUploader({
    mode: 'presignPut',           // choose - 'direct' | 'presignPost'
    bucket: env.S3_BUCKET,
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 10,
    presignMaxSizeMB: 20,
    publicRead: false,
});