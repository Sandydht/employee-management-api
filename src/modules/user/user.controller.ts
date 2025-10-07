import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { GetProfileResponseDto } from './dto/response/GetProfileResponse.dto';
import { UpdateProfileRequestDto } from './dto/request/UpdateProfileRequest.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from 'src/core/storage/s3/s3.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
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

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateProfile(
    @Request() req,
    @Body() body: UpdateProfileRequestDto,
    @Response() res,
  ) {
    const user = await this.userService.updateProfile(req.user.userId, body);
    const transformUser = plainToInstance(GetProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });

    res.json({
      status: 'OK',
      data: transformUser,
    });
  }

  @Post('upload-photo-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo-profile', {
      storage: memoryStorage(),
      fileFilter: (_, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @HttpCode(200)
  async uploadPhotoProfile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Response() res,
  ) {
    await this.s3Service.uploadFile(file, 'photo-profile');
    const user = await this.userService.updatePhotoProfile(
      req.user.userId,
      file,
    );
    const transformUser = plainToInstance(GetProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });

    res.json({
      status: 'OK',
      data: transformUser,
    });
  }
}
