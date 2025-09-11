import type { Context } from 'hono';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export type HealthResult = {
    status: HealthStatus;
    message?: string;
    details?: unknown;
};
export type HealthCheck = {
    name: string;
    check: () => Promise<HealthResult>;
    timeoutMs?: number;
    required?: boolean;
    severity?: 'low' | 'medium' | 'high';
};
export type HealthConfig = {
    checks: HealthCheck[];
    timeoutMs?: number;
    includeSystem?: boolean;
    shortCircuitRequired?: boolean;
};
export declare function createHealthHandler(config: HealthConfig): (c: Context) => Promise<(Response & import("hono").TypedResponse<null, import("hono/utils/http-status").StatusCode, "body">) | (Response & import("hono").TypedResponse<{
    status: HealthStatus;
    timestamp: string;
    duration: number;
    checks: {
        [x: string]: any;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
export declare function createLivenessHandler(): (c: Context) => Promise<Response>;
export declare function createReadinessHandler(config: HealthConfig): (c: Context) => Promise<(Response & import("hono").TypedResponse<null, import("hono/utils/http-status").StatusCode, "body">) | (Response & import("hono").TypedResponse<{
    status: HealthStatus;
    timestamp: string;
    duration: number;
    checks: {
        [x: string]: any;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
//# sourceMappingURL=health-checker.d.ts.map