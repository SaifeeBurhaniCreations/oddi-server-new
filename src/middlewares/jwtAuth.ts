import { jwtAuth } from '../sbc/utils/jwt-auth/jwt-auth.js';
import { env } from '../config/env.js';

export const userJwtAuth = jwtAuth({
  publicKey: env.JWT_PUBLIC_KEY,
  privateKey: env.JWT_PRIVATE_KEY, 
  algorithms: ['ES256'],
  headerName: 'Authorization',
  scheme: 'Bearer',
  issuer: 'https://auth.sbc.com',
  audience: 'oddiville-user-api',
  expiresIn: '12h',
});