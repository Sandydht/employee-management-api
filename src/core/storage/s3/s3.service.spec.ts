import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const env = {
          AWS_REGION: 'ap-southeast-1',
          AWS_ACCESS_KEY_ID: 'fake-key',
          AWS_SECRET_ACCESS_KEY: 'fake-secret',
          AWS_S3_BUCKET_NAME: 'fake-bucket',
        };
        return env[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
