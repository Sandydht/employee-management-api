import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterRequestDto } from './dto/request/RegisterRequest.dto';
import { LoginRequestDto } from './dto/request/LoginRequest.dto';
import { plainToInstance } from 'class-transformer';
import { RegisterResponseDto } from './dto/response/RegisterResponse.dto';
import { LoginResponseDto } from './dto/response/LoginResponse.dto';
import { RefreshTokenRequestDto } from './dto/request/RefreshTokenRequest.dto';
import jsonwebtoken from 'jsonwebtoken';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterRequestDto, @Response() res) {
    const newUser = await this.authenticationService.register(body);
    const transformNewUser = plainToInstance(RegisterResponseDto, newUser, {
      excludeExtraneousValues: true,
    });

    res.json({
      status: 'OK',
      data: transformNewUser,
    });
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginRequestDto,
    @Response({ passthrough: true }) res,
  ) {
    const tokens = await this.authenticationService.login(body);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/authentication/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const transformAccessToken = plainToInstance(LoginResponseDto, tokens, {
      excludeExtraneousValues: true,
    });

    res.json({
      status: 'OK',
      accessToken: transformAccessToken.accessToken,
    });
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() body: RefreshTokenRequestDto,
    @Request() req,
    @Response() res,
  ) {
    const cookie = req.cookies?.refreshToken;
    const token = body.refreshToken || cookie;
    if (!token) {
      throw new BadRequestException('Refresh token missing');
    }

    const decoded: any = jsonwebtoken.verify(
      cookie,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh-secret',
    );
    const userId: string = decoded.sub;

    const tokens = await this.authenticationService.refresh(userId, token);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/authentication/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const transformAccessToken = plainToInstance(LoginResponseDto, tokens, {
      excludeExtraneousValues: true,
    });

    res.json({
      status: 'OK',
      accessToken: transformAccessToken.accessToken,
    });
  }
}
