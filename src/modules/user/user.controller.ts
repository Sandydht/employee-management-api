import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { GetProfileResponseDto } from './dto/response/GetProfileResponse.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req, @Response() res) {
    const user = await this.userService.getProfile(req.user?.userId);
    const transformUser = plainToInstance(GetProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });

    res.json({
      status: 'OK',
      data: transformUser,
    });
  }
}
