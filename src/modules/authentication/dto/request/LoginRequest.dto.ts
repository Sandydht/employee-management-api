import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsPasswordStrong } from 'src/common/validators/is-password-strong.validator';

export class LoginRequestDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email invalid' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsPasswordStrong()
  password: string;
}
