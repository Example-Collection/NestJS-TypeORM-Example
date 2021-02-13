import { Test, TestingModule } from '@nestjs/testing';
import { UserCreateDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { UserModule } from './user.module';

describe('UserService', () => {
  let service: UserService;

  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '1234abc5';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        // TypeOrmModule.forRoot({
        //   type: 'sqlite',
        //   database: ':memory:',
        //   logging: false,
        //   synchronize: true,
        //   entities: ['dist/**/*.entity{.ts,.js}'],
        //   name: 'TestConnection',
        // }),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);

    // return createConnection({
    //   type: 'sqlite',
    //   database: ':memory:',
    //   logging: false,
    //   synchronize: true,
    //   entities: ['dist/**/*.entity{.ts,.js'],
    // });
  });

  // afterEach(async () => {
  //   const connection = getConnection();
  //   return connection.close();
  // });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should Save User', async () => {
    const dto = new UserCreateDto();
    dto.name = NAME;
    dto.email = EMAIL;
    dto.password = PASSWORD;

    const responseDto = await service.saveUser(dto);
    expect(responseDto.getName).toBe(NAME);
    expect(responseDto.getEmail).toBe(EMAIL);
    expect(responseDto.getUserId).toBeInstanceOf(Number);
  });
});
