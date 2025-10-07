import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { S3Service } from 'src/core/storage/s3/s3.service';

describe('UserController', () => {
  let controller: UserController;
  const mockS3Service = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Sandy' }),
            create: jest.fn().mockResolvedValue({ id: 1, name: 'Sandy' }),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
