import { User, UserRole } from '../types';
import { INITIAL_USERS } from './storageService';

const TOKEN_KEY = 'mediroute_jwt_token';
const USER_KEY = 'mediroute_auth_user';

export interface JwtTokenPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Generates a mock standard JWT format (header.payload.signature)
 */
export function generateMockJwt(user: User): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const payload: JwtTokenPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: nowSec,
    exp: nowSec + 86400 * 7, // 7 days expiration
  };

  const encodeBase64Url = (obj: object) => {
    const jsonStr = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headerB64 = encodeBase64Url(header);
  const payloadB64 = encodeBase64Url(payload);
  const mockSignature = btoa(`${headerB64}.${payloadB64}.mediroute_secret_cad_key`)
    .replace(/=/g, '')
    .slice(0, 32);

  return `${headerB64}.${payloadB64}.${mockSignature}`;
}

/**
 * Decodes and validates a mock JWT token
 */
export function verifyAndDecodeJwt(token: string): JwtTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(escape(atob(payloadB64)));
    const payload = JSON.parse(jsonStr) as JwtTokenPayload;

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      console.warn('JWT token has expired');
      return null;
    }

    return payload;
  } catch (err) {
    console.error('Failed to parse JWT token', err);
    return null;
  }
}

/**
 * Storage helpers
 */
export function saveAuthSession(user: User, token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('localStorage not accessible', e);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn('localStorage not accessible', e);
  }
}

export function getStoredAuthSession(): { user: User; token: string } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (!token || !userStr) return null;

    const decoded = verifyAndDecodeJwt(token);
    if (!decoded) {
      clearAuthSession();
      return null;
    }

    const user = JSON.parse(userStr) as User;
    return { user, token };
  } catch {
    return null;
  }
}

// Initial registered users list in mock DB
export const MOCK_CREDENTIALS: Record<string, { password: string; user: User }> = {
  'sarah.jenkins@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[0], // admin
  },
  'admin@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[0], // admin alias
  },
  'marcus.dispatch@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[1], // dispatcher
  },
  'david.r@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[2], // driver
  },
  'driver@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[2], // driver alias
  },
  'hospital@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[3], // hospital staff
  },
  'patient@mediroute.org': {
    password: 'Password123!',
    user: INITIAL_USERS[4], // patient / citizen
  },
  'elena.viewer@healthdept.gov': {
    password: 'Password123!',
    user: INITIAL_USERS[5], // viewer
  },
};
