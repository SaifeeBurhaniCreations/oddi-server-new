function getFirstMatch(q, name, aliases) {
    if (q.has(name))
        return q.get(name) ?? undefined;
    for (const a of aliases ?? []) {
        if (q.has(a))
            return q.get(a) ?? undefined;
    }
    return undefined;
}
export function getPaginationParams(c, config = {}) {
    const q = new URL(c.req.url).searchParams;
    const pageRaw = getFirstMatch(q, config.pageParam ?? 'page', config.aliases?.page);
    const limitRaw = getFirstMatch(q, config.limitParam ?? 'limit', config.aliases?.limit);
    const defaultPage = Math.max(1, Math.trunc(config.defaultPage ?? 1));
    const defaultLimit = Math.max(1, Math.trunc(config.defaultLimit ?? 20));
    const maxLimit = Math.max(1, Math.trunc(config.maxLimit ?? 100));
    let page = Number.parseInt(String(pageRaw ?? defaultPage), 10);
    if (!Number.isFinite(page) || page < 1)
        page = defaultPage;
    let limit = Number.parseInt(String(limitRaw ?? defaultLimit), 10);
    if (!Number.isFinite(limit) || limit < 1)
        limit = defaultLimit;
    if (limit > maxLimit)
        limit = maxLimit;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}
export function createPaginatedResponse(c, data, total, params) {
    const totalPages = Math.max(1, Math.ceil(total / params.limit));
    const hasPrev = params.page > 1;
    const hasNext = params.page < totalPages;
    const links = buildLinkHeader(c, params.page, params.limit, totalPages);
    if (links.header)
        c.header('Link', links.header);
    c.header('X-Total-Count', String(total));
    return {
        data,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
            hasNext,
            hasPrev
        },
        links: links.object
    };
}
function buildLinkHeader(c, page, limit, totalPages) {
    const url = new URL(c.req.url);
    const set = (p) => {
        const u = new URL(url);
        u.searchParams.set('page', String(p));
        u.searchParams.set('limit', String(limit));
        return u.toString();
    };
    const parts = [];
    const obj = {};
    if (page > 1) {
        const first = set(1);
        const prev = set(page - 1);
        parts.push(`<${first}>; rel="first"`, `<${prev}>; rel="prev"`);
        obj.first = first;
        obj.prev = prev;
    }
    if (page < totalPages) {
        const next = set(page + 1);
        const last = set(totalPages);
        parts.push(`<${next}>; rel="next"`, `<${last}>; rel="last"`);
        obj.next = next;
        obj.last = last;
    }
    return { header: parts.join(', '), object: obj };
}
export function getCursorParams(c, defaultLimit = 20, maxLimit = 100) {
    const url = new URL(c.req.url);
    let limit = Number.parseInt(url.searchParams.get('limit') ?? String(defaultLimit), 10);
    if (!Number.isFinite(limit) || limit < 1)
        limit = defaultLimit;
    if (limit > maxLimit)
        limit = maxLimit;
    const after = url.searchParams.get('after') ?? undefined;
    const before = url.searchParams.get('before') ?? undefined;
    return { limit, after, before };
}
export function createCursorResponse(c, data, opts) {
    const url = new URL(c.req.url);
    const links = [];
    const withQP = (k, v) => {
        const u = new URL(url);
        u.searchParams.set(k, v);
        u.searchParams.set('limit', String(opts.limit));
        return u.toString();
    };
    if (opts.nextCursor)
        links.push(`<${withQP('after', opts.nextCursor)}>; rel="next"`);
    if (opts.prevCursor)
        links.push(`<${withQP('before', opts.prevCursor)}>; rel="prev"`);
    if (links.length)
        c.header('Link', links.join(', '));
    c.header('Cache-Control', 'no-store');
    return { data, pageInfo: { hasNext: opts.hasNext, hasPrev: opts.hasPrev, nextCursor: opts.nextCursor, prevCursor: opts.prevCursor, limit: opts.limit } };
}
