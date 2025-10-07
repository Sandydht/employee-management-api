import { IsDateString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { IsPasswordStrong } from 'src/common/validators/is-password-strong.validator';

export class RegisterRequestDto {
  @IsOptional()
  photoUrl: string;

  @IsNotEmpty({ message: 'Fullname cannot be empty' })
  fullname: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date of birth must be in ISO format: YYYY-MM-DD' },
  )
  birthDate: Date;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email invalid' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsPasswordStrong()
  password: string;
}
