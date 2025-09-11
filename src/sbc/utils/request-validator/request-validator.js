/**
 * Validates incoming requests against Zod schemas with:
 * - Generics for better type inference of validated data
 * - multipart/form-data and urlencoded support via parseBody()
 * - cached query parsing to avoid repeated URL decoding
 */
export function validateRequest(config) {
    return async (c, next) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            const validatedData = {};
            if (config.headers) {
                const allHeadersObj = (_a = c.req.header()) !== null && _a !== void 0 ? _a : {};
                const result = config.headers.safeParse(allHeadersObj);
                if (!result.success) {
                    return (_c = (_b = config.onError) === null || _b === void 0 ? void 0 : _b.call(config, result.error.issues, c)) !== null && _c !== void 0 ? _c : c.json({ error: 'Headers validation failed', details: result.error.issues }, 400);
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
                    return (_e = (_d = config.onError) === null || _d === void 0 ? void 0 : _d.call(config, result.error.issues, c)) !== null && _e !== void 0 ? _e : c.json({ error: 'Validation failed', details: result.error.issues }, 400);
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
                    return (_g = (_f = config.onError) === null || _f === void 0 ? void 0 : _f.call(config, result.error.issues, c)) !== null && _g !== void 0 ? _g : c.json({ error: 'Query validation failed', details: result.error.issues }, 400);
                }
                validatedData.query = result.data;
            }
            if (config.params) {
                const result = config.params.safeParse(c.req.param());
                if (!result.success) {
                    return (_j = (_h = config.onError) === null || _h === void 0 ? void 0 : _h.call(config, result.error.issues, c)) !== null && _j !== void 0 ? _j : c.json({ error: 'Params validation failed', details: result.error.issues }, 400);
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
