function normalizeKey(c, prefix, varyHeaders) {
    if (prefix && !prefix.endsWith(':'))
        prefix = prefix + ':';
    const url = new URL(c.req.url);
    const params = [...url.searchParams.entries()].sort(([ak, av], [bk, bv]) => ak === bk ? (av < bv ? -1 : av > bv ? 1 : 0) : (ak < bk ? -1 : 1));
    const q = new URLSearchParams(params).toString();
    let key = `${url.pathname}?${q}`;
    if (varyHeaders?.length) {
        const varyParts = varyHeaders.map(h => `${h}:${c.req.header(h) ?? ''}`).join('|');
        key += `|VARY:${varyParts}`;
    }
    return `${prefix ?? 'cache:'}${key}`;
}
export function cacheManager(cfg = {}) {
    const memory = new Map();
    const ttlDefault = Math.max(1, Math.trunc(cfg.defaultTTL ?? 300));
    return async (c, next) => {
        if (c.req.method !== 'GET' || cfg.skipCache?.(c)) {
            await next();
            return;
        }
        if (cfg.authAware) {
            if (c.req.header('Authorization') || c.req.header('Cookie')) {
                await next();
                return;
            }
        }
        const key = cfg.keyGenerator?.(c) ?? normalizeKey(c, cfg.keyPrefix, cfg.varyHeaders);
        try {
            let cached = null;
            if (cfg.redis) {
                const raw = await cfg.redis.get(key);
                if (raw)
                    cached = JSON.parse(raw);
            }
            else {
                const entry = memory.get(key);
                if (entry && Date.now() < entry.expiresAt)
                    cached = entry;
                else if (entry)
                    memory.delete(key);
            }
            if (cached) {
                cfg.onCacheHit?.(c, key);
                c.header('X-Cache', 'HIT');
                const headers = new Headers(cached.headers);
                return new Response(cached.body, { status: cached.status, headers });
            }
            cfg.onCacheMiss?.(c, key);
            c.header('X-Cache', 'MISS');
            await next();
            const res = c.res;
            if (!res)
                return;
            if (cfg.respectHeaders) {
                const cc = res.headers.get('Cache-Control')?.toLowerCase() ?? '';
                const setCookie = res.headers.get('Set-Cookie');
                if (cc.includes('no-store') || cc.includes('private') || setCookie) {
                    return;
                }
            }
            if (res.status !== 200)
                return;
            const clone = res.clone();
            const bodyText = await clone.text();
            let ttl = ttlDefault;
            if (cfg.respectHeaders) {
                const cc = res.headers.get('Cache-Control') ?? '';
                const m = cc.match(/max-age=(\d+)/);
                if (m)
                    ttl = Math.max(1, parseInt(m[21], 10));
            }
            const entry = {
                status: res.status,
                headers: [...res.headers.entries()],
                body: bodyText,
                expiresAt: Date.now() + ttl * 1000,
            };
            if (cfg.redis) {
                await cfg.redis.set(key, JSON.stringify(entry), 'EX', ttl);
            }
            else {
                memory.set(key, entry);
            }
        }
        catch (err) {
            await next();
        }
    };
}
