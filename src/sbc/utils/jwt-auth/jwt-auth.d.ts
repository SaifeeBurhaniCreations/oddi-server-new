import type { Context, MiddlewareHandler } from 'hono';
import type { StringValue as MsStringValue } from 'ms';
export type NonEmptyArray<T> = readonly [T, ...T[]];
type SymmetricAlg = 'HS256' | 'HS384' | 'HS512';
type AsymmetricAlg = 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'ES256' | 'ES384' | 'ES512' | 'EdDSA';
export type JwtAlg = SymmetricAlg | AsymmetricAlg;
export interface JwtPayload {
    sub: string;
    iat: number;
    exp: number;
    [key: string]: any;
}
export interface JwtConfig {
    secret?: string;
    publicKey?: string | Buffer;
    privateKey?: string | Buffer;
    algorithms: NonEmptyArray<JwtAlg>;
    issuer?: string | string[] | RegExp;
    audience?: string | string[];
    cookieName?: string;
    headerName?: string;
    scheme?: string;
    expiresIn?: number | MsStringValue;
    onUnauthorized?: (c: Context) => Response | Promise<Response>;
}
declare module 'hono' {
    interface ContextVariableMap {
        jwtPayload: JwtPayload;
    }
}
export declare function jwtAuth(rawConfig: JwtConfig): MiddlewareHandler;
export declare function generateToken(payload: Record<string, any>, cfg: JwtConfig): string;
export {};
//# sourceMappingURL=jwt-auth.d.ts.map