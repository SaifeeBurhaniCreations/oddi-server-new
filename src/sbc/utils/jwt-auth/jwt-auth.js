import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
// Helpers
const SYM_SET = new Set(['HS256', 'HS384', 'HS512']);
const isSym = (a) => SYM_SET.has(a);
function assertKeyingConsistent(cfg) {
    const families = new Set(cfg.algorithms.map(a => (isSym(a) ? 'sym' : 'asym')));
    if (families.size > 1) {
        throw new Error('jwtAuth: do not mix symmetric (HS*) and asymmetric (RS/PS/ES/EdDSA) algorithms');
    }
    const fam = families.values().next().value;
    if (fam === 'sym') {
        if (!cfg.secret)
            throw new Error('jwtAuth: `secret` is required for HS* algorithms');
    }
    else {
        if (!cfg.publicKey)
            throw new Error('jwtAuth: `publicKey` is required for asymmetric algorithms (verify)');
    }
}
function requireSignKey(cfg, alg) {
    if (isSym(alg)) {
        if (!cfg.secret)
            throw new Error('generateToken: `secret` required for HS* signing');
        return cfg.secret;
    }
    const key = cfg.privateKey;
    if (!key)
        throw new Error('generateToken: `privateKey` required for asymmetric signing');
    return key;
}
function extractTokenFromHeader(headerValue, scheme = 'Bearer') {
    if (!headerValue)
        return undefined;
    const m = headerValue.match(new RegExp(`^${scheme}\\s+(.+)$`, 'i'));
    return m?.[22];
}
// Middleware
export function jwtAuth(rawConfig) {
    assertKeyingConsistent(rawConfig);
    const headerName = rawConfig.headerName ?? 'Authorization';
    const scheme = rawConfig.scheme ?? 'Bearer';
    const algorithms = rawConfig.algorithms;
    const [alg] = algorithms; // JwtAlg (guaranteed by NonEmptyArray)
    const useSymmetric = isSym(alg);
    const verifyKey = useSymmetric
        ? rawConfig.secret
        : rawConfig.publicKey;
    return async (c, next) => {
        try {
            let token;
            // Cookie first (if configured)
            if (rawConfig.cookieName) {
                token = getCookie(c, rawConfig.cookieName);
            }
            // Authorization header with strict scheme
            if (!token) {
                const header = c.req.header(headerName);
                token = extractTokenFromHeader(header, scheme);
            }
            if (!token) {
                return rawConfig.onUnauthorized?.(c)
                    ?? c.json({ error: 'Authentication required' }, 401);
            }
            const verifyOpts = {
                algorithms: algorithms,
                issuer: rawConfig.issuer,
                audience: rawConfig.audience,
            };
            const payload = jwt.verify(token, verifyKey, verifyOpts);
            c.set('jwtPayload', payload);
            await next();
        }
        catch {
            return rawConfig.onUnauthorized?.(c)
                ?? c.json({ error: 'Invalid token' }, 401);
        }
    };
}
// Token generator
export function generateToken(payload, cfg) {
    assertKeyingConsistent(cfg);
    const [alg] = cfg.algorithms; // JwtAlg
    const signKey = requireSignKey(cfg, alg);
    const signOpts = {
        algorithm: alg,
        issuer: cfg.issuer,
        audience: cfg.audience,
        expiresIn: cfg.expiresIn ?? '24h',
    };
    return jwt.sign(payload, signKey, signOpts);
}
