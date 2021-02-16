import { UnauthorizedException } from '@nestjs/common';
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

function checkExpDate(token: string): void {
  const decodedToken = jwt.verify(token, `${process.env.JWT_SERCET_KEY}`) as {
    exp: number;
  };
  if (decodedToken.exp < Math.floor(Date.now() / 1000) + 86400000) {
    throw new UnauthorizedException(
      'JWT Token is malformed, or it is expired.',
    );
  }
}

export function extractUserId(token: string): number {
  checkExpDate(token);
  const decodedToken = jwt.verify(token, `${process.env.JWT_SERCET_KEY}`) as {
    userId: number;
  };
  return decodedToken.userId;
}
