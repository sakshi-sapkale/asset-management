import type { NextFunction, Request, Response } from 'express';

type KeycloakClaims = {
  resource_access?: Record<string, { roles?: string[] }>;
};

declare global {
  namespace Express {
    interface Request {
      user?: KeycloakClaims;
    }
  }
}

const issuer = process.env.KEYCLOAK_ISSUER;
const audience = process.env.KEYCLOAK_AUDIENCE ?? 'asset-service';
const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'asset-service';
const adminRole = process.env.KEYCLOAK_ADMIN_ROLE ?? 'asset-admin';
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
    const { payload } = await jwtVerify(authorization.slice('Bearer '.length), await jwks, {
      issuer,
      audience,
    });
    req.user = payload as KeycloakClaims;
    next();
  } catch {
    res.status(401).json({ message: 'The bearer token is invalid or expired.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const roles = req.user?.resource_access?.[clientId]?.roles ?? [];

  if (!roles.includes(adminRole)) {
    res.status(403).json({ message: 'Admin access is required.' });
    return;
  }

  next();
}
