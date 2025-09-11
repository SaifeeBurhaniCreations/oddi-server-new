export function requestLogger(config = {}) {
    const lvl = config.logLevel ?? 'info';
    const sampleRate = config.sampleRate ?? 1;
    const maxBody = config.maxBodyLength ?? 8_192;
    return async (c, next) => {
        const inboundId = c.req.header('x-request-id');
        const requestId = inboundId && inboundId.trim() !== '' ? inboundId : (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
        c.set('requestId', requestId);
        c.header('X-Request-ID', requestId);
        if (config.excludePaths?.some(p => typeof p === 'string' ? c.req.path.includes(p) : p.test(c.req.path))) {
            await next();
            return;
        }
        if (sampleRate < 1 && Math.random() > sampleRate) {
            await next();
            return;
        }
        let capturedBody = undefined;
        if (config.includeBody && ['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
            try {
                const r = c.req.raw.clone();
                const ct = r.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const text = await r.text();
                    const clipped = text.length > maxBody ? text.slice(0, maxBody) : text;
                    try {
                        capturedBody = JSON.parse(clipped);
                    }
                    catch {
                        capturedBody = clipped;
                    }
                }
                else if (ct.startsWith('text/')) {
                    const text = await r.text();
                    capturedBody = text.length > maxBody ? text.slice(0, maxBody) : text;
                }
                else {
                    capturedBody = `<${ct || 'unknown'} body omitted>`;
                }
                if (capturedBody && config.sensitiveFields?.length) {
                    const redacted = { ...capturedBody };
                    for (const f of config.sensitiveFields)
                        if (redacted && typeof redacted === 'object' && f in redacted)
                            redacted[f] = '***';
                    capturedBody = redacted;
                }
            }
            catch {
                capturedBody = undefined;
            }
        }
        const t0 = globalThis.performance?.now ? globalThis.performance.now() : Date.now();
        await next();
        const t1 = globalThis.performance?.now ? globalThis.performance.now() : Date.now();
        const duration = Math.max(0, t1 - t0);
        const logData = {
            method: c.req.method,
            path: c.req.path,
            statusCode: c.res.status,
            duration,
            userAgent: c.req.header('user-agent') || undefined,
            ip: parseClientIp(c.req.header('x-forwarded-for'), c.req.header('x-real-ip')),
            timestamp: new Date().toISOString(),
            requestId,
            level: lvl,
            slow: config.slowThresholdMs ? duration >= config.slowThresholdMs : undefined,
        };
        if (config.includeQuery) {
            const qp = Object.fromEntries(new URL(c.req.url).searchParams);
            if (config.sensitiveFields?.length) {
                for (const f of config.sensitiveFields)
                    if (f in qp)
                        qp[f] = '***';
            }
            logData.query = qp;
        }
        if (config.includeHeaders?.length) {
            const headers = {};
            for (const h of config.includeHeaders) {
                const v = c.req.header(h);
                if (v)
                    headers[h] = shouldMask(h, config.headerMasks) ? '***' : v;
            }
            logData.headers = headers;
        }
        if (config.includeBody)
            logData.body = capturedBody;
        config.onLog?.(logData);
        try {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(logData));
        }
        catch { }
    };
}
function parseClientIp(xff, xri) {
    const real = xri?.trim();
    if (real)
        return real;
    const first = xff?.split(',').map(s => s.trim()).find(Boolean);
    return first || undefined;
}
function shouldMask(headerName, masks) {
    if (!masks || masks.length === 0)
        return false;
    const n = headerName.toLowerCase();
    return masks.some(m => m.toLowerCase() === n);
}
