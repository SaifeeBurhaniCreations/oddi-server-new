import type { Context, MiddlewareHandler } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
export interface ErrorLogMeta {
    requestId?: string;
    method: string;
    path: string;
    statusCode: number;
    code?: string;
    details?: unknown;
    userId?: string;
}
export interface ErrorConfig {
    includeStack?: boolean;
    logger?: (error: Error, c: Context, meta: ErrorLogMeta) => void | Promise<void>;
    formatError?: (error: Error, c: Context) => Record<string, any>;
    problemDetails?: boolean | {
        typeBase?: string;
    };
    failSafe?: boolean;
}
export declare class ApiError extends Error {
    statusCode: StatusCode;
    code?: string | undefined;
    details?: any | undefined;
    constructor(message: string, statusCode?: StatusCode, code?: string | undefined, details?: any | undefined);
}
/**
 * Centralized error handling middleware:
 * - Async logger hook for external services
 * - Fail-safe: never throws, always returns a response
 * - Optional RFC 7807 or custom formatter
 * - Uses ContentfulStatusCode so c.json() status typing is correct
 */
export declare function errorHandler(config?: ErrorConfig): MiddlewareHandler;
//# sourceMappingURL=error-handler.d.ts.map