import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/core/database/refresh-token.entity';
import { User } from 'src/core/database/user.entity';
import { Repository } from 'typeorm';
import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
import * as bcrypt from 'bcrypt';
import { LoginRequestDto } from './dto/request/LoginRequest.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(RefreshToken) private rtRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(payload: RegisterRequestDto) {
    const findUserEmail = await this.usersRepo.findOneBy({
      email: payload.email,
    });
    if (findUserEmail) throw new BadRequestException('Email already exist');

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = this.usersRepo.create({
      ...payload,
      birthDate: new Date(payload.birthDate),
      password: hashed,
    });
    const newUser = await this.usersRepo.save(user);
    return newUser;
  }

  async login(payload: LoginRequestDto) {
    const findUser = await this.usersRepo.findOneBy({ email: payload.email });
    if (!findUser) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const isValidPassword = await bcrypt.compare(
      payload.password,
      findUser.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const tokens = this.generateTokens(findUser);

    const hashed = await bcrypt.hash(tokens.refreshToken, 10);
    const rt = this.rtRepo.create({
      tokenHash: hashed,
      user: findUser,
      expiresAt: this.calculateExpiryDate(
        this.config.get<string | number>('JWT_REFRESH_TOKEN_EXPIRATION') ||
          '7d',
      ),
    });
    await this.rtRepo.save(rt);

    return this.generateTokens(findUser);
  }

  async refresh(userId: string, refreshToken: string) {
    const findUser = await this.usersRepo.findOneBy({ id: userId });
    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }

    const findToken = await this.rtRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });
    if (!findToken) {
      throw new UnauthorizedException('No refresh token stored');
    }

    const isMatchRefreshToken = await bcrypt.compare(
      refreshToken,
      findToken.tokenHash,
    );
    if (!isMatchRefreshToken) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    await this.rtRepo.delete({ id: findToken.id });

    const tokens = this.generateTokens(findToken.user);
    const hashed = await bcrypt.hash(tokens.refreshToken, 10);
    const rt = this.rtRepo.create({
      tokenHash: hashed,
      user: findToken.user,
      expiresAt: this.calculateExpiryDate(
        this.config.get<string | number>('JWT_REFRESH_TOKEN_EXPIRATION') ||
          '7d',
      ),
    });

    await this.rtRepo.save(rt);
    return tokens;
  }

  private generateTokens(user: User) {
    const jwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn:
        this.config.get<string | number>('JWT_ACCESS_TOKEN_EXPIRATION') ||
        '15m',
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        this.config.get<string | number>('JWT_REFRESH_TOKEN_EXPIRATION') ||
        '7d',
    });

    return { accessToken, refreshToken };
  }

  private calculateExpiryDate(exp: string | number) {
    if (typeof exp === 'number') {
      return new Date(Date.now() + exp * 1000);
    }
    const match = String(exp).match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const value = parseInt(match[1], 10);
    const unit = match[2];
    let ms = 0;
    switch (unit) {
      case 's':
        ms = value * 1000;
        break;
      case 'm':
        ms = value * 60 * 1000;
        break;
      case 'h':
        ms = value * 3600 * 1000;
        break;
      case 'd':
        ms = value * 24 * 3600 * 1000;
        break;
      default:
        ms = 7 * 24 * 3600 * 1000;
    }
    return new Date(Date.now() + ms);
  }
}
