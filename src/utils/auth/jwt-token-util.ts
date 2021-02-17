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

function checkExpDate(exp: number): void {
  try {
    if (exp * 1000 < Date.now() + 86400000) {
      throw new UnauthorizedException('JWT Token has been expired.');
    }
  } catch (exception) {
    throw new UnauthorizedException('JWT Token is malformed.');
  }
}

export function extractUserId(token: string): number {
  try {
    const decodedToken = jwt.verify(token, `${process.env.JWT_SERCET_KEY}`) as {
      userId: number;
      exp: number;
    };
    checkExpDate(decodedToken.exp);
    return decodedToken.userId;
  } catch (exception) {
    throw new UnauthorizedException('JWT Token is malformed.');
  }
}
