import type { Context } from 'hono';
export interface PaginationConfig {
    defaultLimit?: number;
    maxLimit?: number;
    defaultPage?: number;
    pageParam?: string;
    limitParam?: string;
    aliases?: {
        page?: string[];
        limit?: string[];
    };
}
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    links?: {
        first?: string;
        prev?: string;
        next?: string;
        last?: string;
    };
}
export declare function getPaginationParams(c: Context, config?: PaginationConfig): PaginationParams;
export declare function createPaginatedResponse<T>(c: Context, data: T[], total: number, params: PaginationParams): PaginatedResponse<T>;
export interface CursorParams {
    limit: number;
    after?: string;
    before?: string;
}
export interface CursorResponse<T> {
    data: T[];
    pageInfo: {
        hasNext: boolean;
        hasPrev: boolean;
        nextCursor?: string;
        prevCursor?: string;
        limit: number;
    };
}
export declare function getCursorParams(c: Context, defaultLimit?: number, maxLimit?: number): CursorParams;
export declare function createCursorResponse<T>(c: Context, data: T[], opts: {
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
    limit: number;
}): CursorResponse<T>;
//# sourceMappingURL=paginator.d.ts.map