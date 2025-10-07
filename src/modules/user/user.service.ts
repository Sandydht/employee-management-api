import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/core/database/user.entity';
import { Repository } from 'typeorm';
import { GetProfileRequestDto } from './dto/request/GetProfileRequest.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async getProfile(payload: GetProfileRequestDto) {
    const user = await this.usersRepo.findOneBy({ id: payload.userId });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
