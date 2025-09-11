import type { MiddlewareHandler } from 'hono';
export interface LoggerConfig {
    includeBody?: boolean;
    includeQuery?: boolean;
    includeHeaders?: string[];
    excludePaths?: (string | RegExp)[];
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    onLog?: (logData: RequestLogData) => void;
    sensitiveFields?: string[];
    headerMasks?: string[];
    sampleRate?: number;
    slowThresholdMs?: number;
    maxBodyLength?: number;
}
export interface RequestLogData {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
    userAgent?: string;
    ip?: string;
    body?: any;
    query?: any;
    headers?: Record<string, string>;
    timestamp: string;
    requestId: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    slow?: boolean;
}
export declare function requestLogger(config?: LoggerConfig): MiddlewareHandler;
//# sourceMappingURL=request-logger.d.ts.map