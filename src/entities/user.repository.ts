import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByEmailAndPassword(email: string, password: string): Promise<User> {
    return this.createQueryBuilder()
      .where('u.email = :email', { email })
      .andWhere('u.password = :password', { password })
      .getOne();
  }
}
