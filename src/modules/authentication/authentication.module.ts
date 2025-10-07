import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/database/user.entity';
import { RefreshToken } from 'src/core/database/refresh-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn:
            config.get<string | number>('JWT_ACCESS_TOKEN_EXPIRATION') || '15m',
        },
      }),
    }),
  ],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
