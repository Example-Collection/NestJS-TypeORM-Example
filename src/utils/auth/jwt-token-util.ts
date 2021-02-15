import * as jwt from 'jsonwebtoken';

export function generateAccessToken(userId: number): string {
  return jwt.sign(
    {
      userId: userId,
      exp: Math.floor(Date.now() / 1000) + 86400000,
    },
    `${process.env.JWT_SERCET_KEY}`,
  );
}

export function extractUserId(token: string) {
  return jwt.verify(token, process.env.JWT_SERCET_KEY);
}
