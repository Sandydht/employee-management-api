import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/core/database/user.entity';
import { Repository } from 'typeorm';
import { GetProfileRequestDto } from './dto/request/GetProfileRequest.dto';
import { UpdateProfileRequestDto } from './dto/request/UpdateProfileRequest.dto';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  get awsRegion(): string {
    return this.configService.get<string>('AWS_REGION') || '';
  }

  get awsBucketName(): string {
    return this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
  }

  async getProfile(payload: GetProfileRequestDto) {
    const user = await this.usersRepo.findOneBy({ id: payload.userId });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async updateProfile(userId: string, payload: UpdateProfileRequestDto) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.usersRepo.update(userId, {
      fullname: payload.fullname,
      birthDate: payload.birthDate,
    });

    return this.usersRepo.findOneBy({ id: userId });
  }

  async updatePhotoProfile(userId: string, file: Express.Multer.File) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException();
    }

    const ext = extname(file.originalname);
    const baseName = file.originalname
      .replace(ext, '')
      .replace(/\s+/g, '_')
      // eslint-disable-next-line no-useless-escape
      .replace(/[^\w\-]/g, '')
      .toLowerCase();
    const key = `photo-profile/${uuid()}-${baseName}`;

    await this.usersRepo.update(userId, {
      photoUrl: `${key}${ext}`,
    });

    const updatedUser = await this.usersRepo.findOneBy({ id: userId });
    return {
      ...updatedUser,
      photoUrl: `https://${this.awsBucketName}.s3.${this.awsRegion}.amazonaws.com/${key}${ext}`,
    };
  }
}
