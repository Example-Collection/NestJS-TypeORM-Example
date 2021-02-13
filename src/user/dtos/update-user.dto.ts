import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserCreateDto } from './create-user.dto';

export class UserUpdateDto extends PartialType(
  OmitType(UserCreateDto, ['email'] as const),
) {}
