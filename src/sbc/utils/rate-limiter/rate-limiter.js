const memoryStore = new Map();
const defaultKeyGen = (c) => {
    const userId = c.get('authUserId');
    if (userId)
        return `uid:${userId}`;
    const apiKey = c.req.header('x-api-key');
    if (apiKey)
        return `ak:${apiKey}`;
    const realIp = c.req.header('x-real-ip') ||
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-forwarded-for') ||
        'unknown';
    return `ip:${realIp}`;
};
function setRateHeaders(c, max, remaining, resetDeltaSec) {
    // IETF draft headers
    c.header('RateLimit-Limit', String(max));
    c.header('RateLimit-Remaining', String(Math.max(0, remaining)));
    c.header('RateLimit-Reset', String(Math.max(0, Math.ceil(resetDeltaSec))));
    // Legacy headers
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, remaining)));
    c.header('X-RateLimit-Reset', String(Math.ceil((Date.now() / 1000) + Math.max(0, resetDeltaSec))));
}
const FIXED_WINDOW_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local window = tonumber(ARGV[2]) -- seconds
local now = tonumber(ARGV[3])

local state = redis.call('HMGET', key, 'count','reset')
local count = tonumber(state[1])
local reset = tonumber(state[2])

if reset == nil or now >= reset then
  count = 0
  reset = now + window
end

count = count + 1
local remaining = math.max(0, capacity - count)
local resetDelta = math.max(0, reset - now)

redis.call('HMSET', key, 'count', count, 'reset', reset)
redis.call('EXPIRE', key, window)

local allowed = (count <= capacity) and 1 or 0
return {allowed, count, remaining, resetDelta}
`;
const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill = tonumber(ARGV[2]) -- tokens per second
local now = tonumber(ARGV[3])

local state = redis.call('HMGET', key, 'tokens','ts')
local tokens = tonumber(state[1])
local ts = tonumber(state[2])

if tokens == nil then
  tokens = capacity
  ts = now
else
  local elapsed = math.max(0, now - ts)
  tokens = math.min(capacity, tokens + (elapsed * refill))
  ts = now
end

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

local resetDelta = 0
if tokens < capacity then
  resetDelta = math.ceil((capacity - tokens) / refill)
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', ts)
redis.call('EXPIRE', key, math.max(1, resetDelta))

return {allowed, math.floor(tokens), resetDelta}
`;
const TOKEN_BUCKET_REFUND_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local state = redis.call('HMGET', key, 'tokens')
local tokens = tonumber(state[1]) or capacity
tokens = math.min(capacity, tokens + 1)
redis.call('HSET', key, 'tokens', tokens)
return tokens
`;
async function fixedWindowAtomic(redis, key, max, windowMs) {
    const nowSec = Math.floor(Date.now() / 1000);
    const res = (await redis.eval(FIXED_WINDOW_LUA, 1, `rl:${key}:fw`, max, Math.ceil(windowMs / 1000), nowSec));
    const allowed = res[0] === 1;
    const count = res[1];
    const remaining = res[2];
    const resetDeltaSec = res[3];
    return { allowed, count, remaining, resetDeltaSec };
}
async function tokenBucket(redis, key, capacity, windowMs) {
    const refillPerSec = capacity / (windowMs / 1000);
    const nowSec = Math.floor(Date.now() / 1000);
    const res = (await redis.eval(TOKEN_BUCKET_LUA, 1, `rl:${key}:tb`, capacity, refillPerSec, nowSec));
    const allowed = res[0] === 1;
    const remaining = res[1];
    const resetDeltaSec = res[2];
    return { allowed, remaining, resetDeltaSec };
}
async function tokenBucketRefund(redis, key, capacity) {
    await redis.eval(TOKEN_BUCKET_REFUND_LUA, 1, `rl:${key}:tb`, capacity);
}
async function redisSlidingWindow(redis, key, windowMs, max) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const rlKey = `rl:${key}:sw`;
    const tx = redis.multi();
    tx.zremrangebyscore(rlKey, 0, windowStart);
    tx.zcard(rlKey);
    const member = `${now}-${Math.random()}`;
    tx.zadd(rlKey, now, member);
    tx.expire(rlKey, Math.ceil(windowMs / 1000) * 2);
    const results = await tx.exec();
    const count = Number(results?.[1]?.[1] ?? 0);
    const used = count + 1;
    const remaining = Math.max(0, max - used);
    const oldestScore = await redis.zrange(rlKey, 0, 0, 'BYSCORE', 'WITHSCORES').then(r => Number(r?.[1] ?? now));
    const resetDeltaSec = Math.max(0, Math.ceil((oldestScore + windowMs - now) / 1000));
    const allowed = used <= max;
    return { allowed, remaining: Math.max(0, remaining), resetDeltaSec, member, rlKey };
}
async function slidingWindowRefund(redis, rlKey, member) {
    await redis.zrem(rlKey, member);
}
function shouldCount(status, cfg) {
    if (cfg.skipSuccessfulRequests && status >= 200 && status < 400)
        return false;
    if (cfg.skipFailedRequests && status >= 400)
        return false;
    return true;
}
export function rateLimiter(cfg) {
    const algorithm = cfg.algorithm ?? 'fixed-window';
    const keyGen = cfg.keyGenerator ?? defaultKeyGen;
    return async (c, next) => {
        const key = keyGen(c);
        const now = Date.now();
        let allowed = true;
        let remaining = cfg.max;
        let resetDeltaSec = Math.ceil(cfg.windowMs / 1000);
        let swMember;
        let swKey;
        try {
            if (cfg.redis) {
                if (algorithm === 'token-bucket') {
                    const tb = await tokenBucket(cfg.redis, key, cfg.max, cfg.windowMs);
                    allowed = tb.allowed;
                    remaining = tb.remaining;
                    resetDeltaSec = tb.resetDeltaSec;
                }
                else if (algorithm === 'sliding-window') {
                    const sw = await redisSlidingWindow(cfg.redis, key, cfg.windowMs, cfg.max);
                    allowed = sw.allowed;
                    remaining = sw.remaining;
                    resetDeltaSec = sw.resetDeltaSec;
                    swMember = sw.member;
                    swKey = sw.rlKey;
                }
                else {
                    const fw = await fixedWindowAtomic(cfg.redis, key, cfg.max, cfg.windowMs);
                    allowed = fw.allowed;
                    remaining = fw.remaining;
                    resetDeltaSec = fw.resetDeltaSec;
                }
            }
            else {
                const entry = memoryStore.get(key);
                if (!entry || now >= entry.resetTime) {
                    memoryStore.set(key, { count: 1, resetTime: now + cfg.windowMs });
                    allowed = true;
                    remaining = cfg.max - 1;
                    resetDeltaSec = Math.ceil(cfg.windowMs / 1000);
                }
                else {
                    const count = entry.count + 1;
                    const newEntry = { count, resetTime: entry.resetTime };
                    memoryStore.set(key, newEntry);
                    allowed = count <= cfg.max;
                    remaining = Math.max(0, cfg.max - count);
                    resetDeltaSec = Math.max(0, Math.ceil((entry.resetTime - now) / 1000));
                }
            }
            setRateHeaders(c, cfg.max, remaining, resetDeltaSec);
            if (!allowed) {
                cfg.onLimitReached?.(c);
                c.header('Retry-After', String(Math.max(1, resetDeltaSec)));
                return c.json({
                    error: cfg.message ?? 'Too many requests',
                    retryAfter: resetDeltaSec,
                }, 429);
            }
            await next();
            if (cfg.redis && (cfg.skipSuccessfulRequests || cfg.skipFailedRequests)) {
                const status = c.res.status;
                if (!shouldCount(status, cfg)) {
                    if (algorithm === 'token-bucket') {
                        await tokenBucketRefund(cfg.redis, key, cfg.max);
                    }
                    else if (algorithm === 'sliding-window') {
                        if (swKey && swMember)
                            await slidingWindowRefund(cfg.redis, swKey, swMember);
                    }
                    else {
                        await cfg.redis.hincrby(`rl:${key}:fw`, 'count', -1);
                    }
                }
            }
        }
        catch (e) {
            await next();
            return;
        }
    };
}
