import { jwtAuth } from '../sbc/utils/jwt-auth/jwt-auth.js';
import { JWT_CONFIG } from "../constants/jwtAuth.js"

export const userJwtAuth = jwtAuth(JWT_CONFIG);