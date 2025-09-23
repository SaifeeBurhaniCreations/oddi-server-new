import type { Context } from "hono";
import { generateToken } from "../sbc/utils/jwt-auth/jwt-auth.js";

export function issueToken(userPayload: { id: string; email: string; role: string }, c: Context) {
    const jwtConfig = c.get("jwtConfig")
    
    return generateToken(userPayload, jwtConfig);
}