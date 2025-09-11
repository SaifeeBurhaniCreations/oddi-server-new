function pickStatusCode(overall) {
    return overall === 'unhealthy' ? 503 : 200;
}
function withTimeout(p, ms, label) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error(`${label} timeout`)), Math.max(1, ms));
        p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
}
export function createHealthHandler(config) {
    const defaultTimeout = Math.max(1, Math.trunc(config.timeoutMs ?? 5000));
    return async (c) => {
        const start = Date.now();
        const results = {};
        let anyDegraded = false;
        let anyUnhealthyRequired = false;
        // Optionally short-circuit on required failures (sequential)
        if (config.shortCircuitRequired) {
            for (const check of config.checks) {
                const perTimeout = Math.max(1, Math.trunc(check.timeoutMs ?? defaultTimeout));
                const t0 = Date.now();
                try {
                    const result = await withTimeout(check.check(), perTimeout, check.name);
                    results[check.name] = { ...result, duration: Date.now() - t0, required: !!check.required, severity: check.severity };
                    if (result.status === 'unhealthy') {
                        if (check.required) {
                            anyUnhealthyRequired = true;
                            break;
                        }
                        anyDegraded = true;
                    }
                    else if (result.status === 'degraded') {
                        anyDegraded = true;
                    }
                }
                catch (e) {
                    results[check.name] = {
                        status: 'unhealthy',
                        message: e instanceof Error ? e.message : 'Check failed',
                        duration: Date.now() - t0,
                        required: !!check.required,
                        severity: check.severity,
                    };
                    if (check.required) {
                        anyUnhealthyRequired = true;
                        break;
                    }
                    anyDegraded = true;
                }
            }
        }
        else {
            await Promise.allSettled(config.checks.map(async (check) => {
                const perTimeout = Math.max(1, Math.trunc(check.timeoutMs ?? defaultTimeout));
                const t0 = Date.now();
                try {
                    const result = await withTimeout(check.check(), perTimeout, check.name);
                    results[check.name] = { ...result, duration: Date.now() - t0, required: !!check.required, severity: check.severity };
                    if (result.status === 'unhealthy') {
                        if (check.required)
                            anyUnhealthyRequired = true;
                        else
                            anyDegraded = true;
                    }
                    else if (result.status === 'degraded') {
                        anyDegraded = true;
                    }
                }
                catch (e) {
                    results[check.name] = {
                        status: 'unhealthy',
                        message: e instanceof Error ? e.message : 'Check failed',
                        duration: Date.now() - t0,
                        required: !!check.required,
                        severity: check.severity,
                    };
                    if (check.required)
                        anyUnhealthyRequired = true;
                    else
                        anyDegraded = true;
                }
            }));
        }
        const overall = anyUnhealthyRequired ? 'unhealthy' : (anyDegraded ? 'degraded' : 'healthy');
        if (config.includeSystem && typeof process !== 'undefined') {
            results.system = {
                uptime: typeof process.uptime === 'function' ? process.uptime() : undefined,
                memory: typeof process.memoryUsage === 'function' ? process.memoryUsage() : undefined,
                version: process.version,
                platform: process.platform,
            };
        }
        const body = {
            status: overall,
            timestamp: new Date().toISOString(),
            duration: Date.now() - start,
            checks: results,
        };
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
        c.header('Pragma', 'no-cache');
        c.header('Expires', '0');
        const code = pickStatusCode(overall);
        if (c.req.method === 'HEAD') {
            c.status(code);
            return c.body(null);
        }
        c.status(code);
        return c.json(body);
    };
}
export function createLivenessHandler() {
    return async (c) => {
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
        c.header('Pragma', 'no-cache');
        c.header('Expires', '0');
        if (c.req.method === 'HEAD')
            return c.body(null, 200);
        return c.json({ status: 'healthy', timestamp: new Date().toISOString() }, 200);
    };
}
export function createReadinessHandler(config) {
    return createHealthHandler(config);
}
