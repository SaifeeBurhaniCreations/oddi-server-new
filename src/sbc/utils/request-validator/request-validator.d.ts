import { z } from 'zod';
import type { Context, MiddlewareHandler } from 'hono';
type InferIf<T extends z.ZodTypeAny | undefined> = T extends z.ZodTypeAny ? z.infer<T> : undefined;
export interface ValidatorConfig {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
    headers?: z.ZodSchema;
    onError?: (errors: z.ZodIssue[], c: Context) => Response | Promise<Response>;
}
export type ValidatedData<T extends ValidatorConfig> = {
    body: InferIf<T['body']>;
    query: InferIf<T['query']>;
    params: InferIf<T['params']>;
    headers: InferIf<T['headers']>;
};
declare module 'hono' {
    interface ContextVariableMap {
        validated: Record<string, unknown>;
        parsedQuery: Record<string, string>;
    }
}
/**
 * Validates incoming requests against Zod schemas with:
 * - Generics for better type inference of validated data
 * - multipart/form-data and urlencoded support via parseBody()
 * - cached query parsing to avoid repeated URL decoding
 */
export declare function validateRequest<T extends ValidatorConfig>(config: T): MiddlewareHandler;
export {};
//# sourceMappingURL=request-validator.d.ts.map