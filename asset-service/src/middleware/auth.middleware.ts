import type { NextFunction, Request, Response } from 'express';

const issuer = process.env.KEYCLOAK_ISSUER;
const audience = process.env.KEYCLOAK_AUDIENCE ?? 'asset-service';
const jose = import('jose');
const jwks = issuer
  ? jose.then(({ createRemoteJWKSet }) => createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`)))
  : undefined;

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!issuer || !jwks) {
    res.status(500).json({ message: 'Keycloak authentication is not configured.' });
    return;
  }

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'A bearer token is required.' });
    return;
  }

  try {
    const { jwtVerify } = await jose;
    await jwtVerify(authorization.slice('Bearer '.length), await jwks, {
      issuer,
      audience,
    });
    next();
  } catch {
    res.status(401).json({ message: 'The bearer token is invalid or expired.' });
  }
}
