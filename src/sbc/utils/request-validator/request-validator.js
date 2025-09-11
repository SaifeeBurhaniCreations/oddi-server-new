/**
 * Validates incoming requests against Zod schemas with:
 * - Generics for better type inference of validated data
 * - multipart/form-data and urlencoded support via parseBody()
 * - cached query parsing to avoid repeated URL decoding
 */
export function validateRequest(config) {
    return async (c, next) => {
        try {
            const validatedData = {};
            if (config.headers) {
                const allHeadersObj = c.req.header() ?? {};
                const result = config.headers.safeParse(allHeadersObj);
                if (!result.success) {
                    return config.onError?.(result.error.issues, c) ??
                        c.json({ error: 'Headers validation failed', details: result.error.issues }, 400);
                }
                validatedData.headers = result.data;
            }
            if (config.body) {
                const contentType = c.req.header('content-type') || '';
                let parsed = {};
                if (contentType.includes('application/json')) {
                    parsed = await c.req.json().catch(() => ({}));
                }
                else if (contentType.includes('multipart/form-data') ||
                    contentType.includes('application/x-www-form-urlencoded')) {
                    parsed = await c.req.parseBody();
                }
                else {
                    const txt = await c.req.text().catch(() => '');
                    try {
                        parsed = txt ? JSON.parse(txt) : {};
                    }
                    catch {
                        parsed = { _raw: txt };
                    }
                }
                const result = config.body.safeParse(parsed);
                if (!result.success) {
                    return config.onError?.(result.error.issues, c) ??
                        c.json({ error: 'Validation failed', details: result.error.issues }, 400);
                }
                validatedData.body = result.data;
            }
            let parsedQuery = c.get('parsedQuery');
            if (!parsedQuery) {
                parsedQuery = Object.fromEntries(new URL(c.req.url).searchParams);
                c.set('parsedQuery', parsedQuery);
            }
            if (config.query) {
                const result = config.query.safeParse(parsedQuery);
                if (!result.success) {
                    return config.onError?.(result.error.issues, c) ??
                        c.json({ error: 'Query validation failed', details: result.error.issues }, 400);
                }
                validatedData.query = result.data;
            }
            if (config.params) {
                const result = config.params.safeParse(c.req.param());
                if (!result.success) {
                    return config.onError?.(result.error.issues, c) ??
                        c.json({ error: 'Params validation failed', details: result.error.issues }, 400);
                }
                validatedData.params = result.data;
            }
            c.set('validated', validatedData);
            await next();
        }
        catch (error) {
            return c.json({ error: 'Validation error', message: String(error) }, 500);
        }
    };
}
