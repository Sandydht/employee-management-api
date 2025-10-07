import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProfileRequestDto {
  @IsNotEmpty({ message: 'Fullname cannot be empty' })
  fullname: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date of birth must be in ISO format: YYYY-MM-DD' },
  )
  birthDate: Date;
}
