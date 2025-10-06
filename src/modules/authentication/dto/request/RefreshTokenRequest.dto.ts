import { IsOptional } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsOptional()
  refreshToken?: string;
}
