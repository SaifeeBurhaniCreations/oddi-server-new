import { env } from '../config/env.js';
import type { JwtAlg, NonEmptyArray } from '../sbc/utils/jwt-auth/jwt-auth.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicKey = await fs.readFile(env.JWT_PUBLIC_KEY, 'utf8')
const privateKey = await fs.readFile(env.JWT_PRIVATE_KEY, 'utf8')

export const JWT_CONFIG = {
    publicKey: publicKey,
    privateKey: privateKey,
    algorithms: ['ES256'] as NonEmptyArray<JwtAlg>,
    headerName: 'Authorization',
    scheme: 'Bearer',
    issuer: 'https://auth.sbcws.com',
    audience: 'oddiville-user-api',
    expiresIn: '12h',
};
