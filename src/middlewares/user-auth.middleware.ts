import {
  UnauthorizedException,
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import IUserRequest from '../interfaces/user-request';
@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  private checkSchemaAndReturnToken(header: string): string {
    const splitTemp = header.split(' ');
    if (splitTemp[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Authorization Header Schema must be Bearer.',
      );
    } else {
      return splitTemp[1];
    }
  }
  use(req: IUserRequest, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];
    if (!!authorizationHeader) {
      const token = this.checkSchemaAndReturnToken(authorizationHeader);
      req.accessToken = token;
      next();
    } else throw new BadRequestException('Authorization Header is missing.');
  }
}
