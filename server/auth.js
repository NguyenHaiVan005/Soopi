import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'soopi-super-secret-key-2026-secure-edge-cloudflare';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function authMiddleware(c, next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (payload) {
      c.set('user', payload);
    }
  }
  await next();
}

export function requireAuth(c, next) {
  const user = c.get('user');
  if (!user) {
    return c.json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục' }, 401);
  }
  return next();
}

export function requireAdmin(c, next) {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Bạn không có quyền truy cập trang quản trị' }, 403);
  }
  return next();
}

