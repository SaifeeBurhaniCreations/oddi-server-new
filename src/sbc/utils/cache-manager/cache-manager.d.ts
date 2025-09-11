import type { Context, MiddlewareHandler } from 'hono';
import type Redis from 'ioredis';
export interface CacheConfig {
    redis?: Redis;
    defaultTTL?: number;
    keyPrefix?: string;
    keyGenerator?: (c: Context) => string;
    skipCache?: (c: Context) => boolean;
    onCacheHit?: (c: Context, key: string) => void;
    onCacheMiss?: (c: Context, key: string) => void;
    respectHeaders?: boolean;
    authAware?: boolean;
    varyHeaders?: string[];
}
export declare function cacheManager(cfg?: CacheConfig): MiddlewareHandler;
//# sourceMappingURL=cache-manager.d.ts.map