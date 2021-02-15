import * as jwt from 'jsonwebtoken';

export function generateAccessToken(userId: number): string {
  const secretKey = process.env.JWT_SERCET_KEY;
  return jwt.sign(
    {
      userId: userId,
      exp: Math.floor(Date.now() / 1000) + 86400000,
    },
    secretKey,
  );
}

export function extractUserId(token: string) {
  return jwt.verify(token, process.env.JWT_SERCET_KEY);
}
