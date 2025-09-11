export class ApiError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'ApiError';
    }
}
// ————— Helpers —————
function safeContentfulStatus(code) {
    const n = typeof code === 'number' ? code : 500;
    const s = n >= 400 && n <= 599 ? n : 500;
    return s;
}
function getRequestId(c) {
    return c.get('requestId') || c.req.header('x-request-id') || undefined;
}
function getUserId(c) {
    return c.get('authUserId') || undefined;
}
function defaultProblemType(base, status) {
    return base ? `${base.replace(/\/$/, '')}/${status}` : 'about:blank';
}
function buildBasicError(err, c, statusCode, includeStack) {
    const body = {
        error: err?.message || 'Internal Server Error',
        code: err?.code,
        requestId: getRequestId(c),
    };
    if (err?.details)
        body.details = err.details;
    if (includeStack && err?.stack)
        body.stack = err.stack;
    return body;
}
function buildProblemDetails(err, c, statusCode, includeStack, typeBase) {
    const obj = {
        type: defaultProblemType(typeBase, statusCode),
        title: err?.message || 'HTTP Error',
        status: statusCode,
        detail: err?.details ? (typeof err.details === 'string' ? err.details : undefined) : undefined,
        instance: c.req.path,
        requestId: getRequestId(c),
        code: err?.code,
    };
    if (err?.details && typeof err.details !== 'string')
        obj.details = err.details;
    if (includeStack && err?.stack)
        obj.stack = err.stack;
    return obj;
}
/**
 * Centralized error handling middleware:
 * - Async logger hook for external services
 * - Fail-safe: never throws, always returns a response
 * - Optional RFC 7807 or custom formatter
 * - Uses ContentfulStatusCode so c.json() status typing is correct
 */
export function errorHandler(config = {}) {
    const failSafe = config.failSafe ?? true;
    return async (c, next) => {
        try {
            await next();
        }
        catch (e) {
            const err = e;
            const statusCode = safeContentfulStatus(err?.statusCode ?? 500);
            const meta = {
                requestId: getRequestId(c),
                method: c.req.method,
                path: c.req.path,
                statusCode,
                code: err?.code,
                details: err?.details,
                userId: getUserId(c),
            };
            if (config.logger) {
                try {
                    await config.logger(err, c, meta);
                }
                catch { }
            }
            let responseBody;
            let contentType;
            try {
                if (config.formatError) {
                    responseBody = config.formatError(err, c);
                }
                else if (config.problemDetails) {
                    const typeBase = typeof config.problemDetails === 'object' ? config.problemDetails.typeBase : undefined;
                    responseBody = buildProblemDetails(err, c, statusCode, config.includeStack, typeBase);
                    contentType = 'application/problem+json';
                }
                else {
                    responseBody = buildBasicError(err, c, statusCode, config.includeStack);
                }
            }
            catch {
                responseBody = {
                    error: 'Internal Server Error',
                    requestId: getRequestId(c),
                };
            }
            if (contentType)
                c.header('Content-Type', contentType);
            return c.json(responseBody, statusCode);
        }
    };
}
// import { Hono } from 'hono'
// import { errorHandler, ApiError } from './error-handler'
// import * as Sentry from '@sentry/node'
// const app = new Hono()
// app.use('*', async (c, next) => {
//   const rid = c.req.header('x-request-id') ?? crypto.randomUUID()
//   c.set('requestId', rid)
//   await next()
// })
// app.use('*', async (c, next) => {
//   c.set('authUserId', user.id)
//   await next()
// })
// Sentry.init({ dsn: process.env.SENTRY_DSN })
// app.use(
//   '*',
//   errorHandler({
//     problemDetails: { typeBase: 'https://api.example.com/problems' },
//     includeStack: process.env.NODE_ENV !== 'production',
//     logger: async (err, c, meta) => {
//       Sentry.captureException(err, (scope) => {
//         scope.setTag('route', c.req.path)
//         if (meta.requestId) scope.setTag('requestId', meta.requestId)
//         if (meta.code) scope.setTag('code', String(meta.code))
//         if (meta.userId) scope.setUser({ id: meta.userId })
//         scope.setContext('http', {
//           method: meta.method,
//           path: meta.path,
//           status: meta.statusCode,
//         })
//         if (meta.details) scope.setContext('details', meta.details as any)
//         return scope
//       })
//     },
//   })
// )
