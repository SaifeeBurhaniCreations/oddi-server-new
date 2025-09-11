import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { HTTPException } from 'hono/http-exception';
import { fileTypeFromBuffer } from 'file-type';
function safeFilename(original) {
    const ext = original.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    return `${randomUUID()}.${ext}`;
}
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9_.-]/g, '');
}
export function fileUploader(config = {}) {
    return async (c, next) => {
        const contentType = c.req.header('Content-Type');
        if (!contentType?.includes('multipart/form-data')) {
            await next();
            return;
        }
        try {
            const formData = await c.req.formData();
            const uploadedFiles = [];
            let fileCount = 0;
            for (const [key, value] of formData.entries()) {
                if (!(value instanceof File))
                    continue;
                fileCount++;
                if (config.maxFiles && fileCount > config.maxFiles)
                    throw new HTTPException(429, { message: 'Too many files' });
                const originalName = sanitizeFilename(value.name);
                const ext = originalName.split('.').pop()?.toLowerCase() || '';
                const filename = config.generateFilename?.(originalName) ?? safeFilename(originalName);
                const outPath = path.resolve(config.uploadPath ?? './uploads', filename);
                if (config.maxSize && value.size > config.maxSize)
                    throw new HTTPException(400, { message: `File too large: ${originalName}` });
                if (config.allowedExts && !config.allowedExts.includes(ext))
                    throw new HTTPException(400, { message: `Extension not allowed: .${ext}` });
                if (config.allowedTypes && !config.allowedTypes.includes(value.type))
                    throw new HTTPException(400, { message: `MIME type not allowed: ${value.type}` });
                const buf = Buffer.from(await value.arrayBuffer());
                const magic = await fileTypeFromBuffer(buf);
                if (magic && config.allowedTypes && !config.allowedTypes.includes(magic.mime))
                    throw new HTTPException(400, { message: `Magic mismatch: ${magic.mime}` });
                if (config.validateFile) {
                    const error = config.validateFile(value);
                    if (error)
                        throw new HTTPException(400, { message: error });
                }
                await fs.mkdir(path.dirname(outPath), { recursive: true });
                await fs.writeFile(outPath, buf);
                if (config.scanFile) {
                    try {
                        await config.scanFile(outPath);
                    }
                    catch (scanError) {
                        await fs.unlink(outPath).catch(() => { });
                        throw new HTTPException(403, { message: 'Malware detected or scan failed.' });
                    }
                }
                uploadedFiles.push({
                    originalName,
                    filename,
                    size: value.size,
                    mimetype: value.type,
                    ext,
                    path: outPath
                });
            }
            if (uploadedFiles.length === 0)
                throw new HTTPException(400, { message: 'No files uploaded' });
            await config.onUploadComplete?.(uploadedFiles);
            c.set('uploadedFiles', uploadedFiles);
            await next();
        }
        catch (error) {
            if (typeof error.filesToCleanup === 'object') {
                for (const filePath of error.filesToCleanup)
                    await fs.unlink(filePath).catch(() => { });
            }
            throw new HTTPException(error?.message || 'Upload failed', error?.statusCode || 400);
        }
    };
}
