import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/database/user.entity';
import { RefreshToken } from 'src/core/database/refresh-token.entity';
import { S3Service } from 'src/core/storage/s3/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [UserService, S3Service],
  controllers: [UserController],
})
export class UserModule {}
