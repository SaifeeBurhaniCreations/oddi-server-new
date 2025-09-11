import type { MiddlewareHandler } from 'hono';
export interface FileUploadConfig {
    maxSize?: number;
    maxFiles?: number;
    allowedTypes?: string[];
    allowedExts?: string[];
    uploadPath?: string;
    generateFilename?: (originalName: string) => string;
    onUploadComplete?: (files: UploadedFile[]) => Promise<void> | void;
    validateFile?: (file: File) => string | null;
    scanFile?: (filePath: string) => Promise<void>;
}
export interface UploadedFile {
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
    ext: string;
    path: string;
}
export declare function fileUploader(config?: FileUploadConfig): MiddlewareHandler;
//# sourceMappingURL=file-uploader.d.ts.map