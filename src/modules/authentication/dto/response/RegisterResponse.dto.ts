import { Expose, Transform } from 'class-transformer';
import dayjs from 'dayjs';

export class RegisterResponseDto {
  @Expose()
  id: string;

  @Expose()
  photoUrl: string;

  @Expose()
  fullname: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD') : null))
  birthDate: string;

  @Expose()
  @Transform(({ value }) => (value ? dayjs(value).toISOString() : null))
  createdAt: string;

  @Expose()
  @Transform(({ value }) => (value ? dayjs(value).toISOString() : null))
  updatedAt: string;
}
