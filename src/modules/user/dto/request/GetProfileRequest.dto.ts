import { IsNotEmpty } from 'class-validator';

export class GetProfileRequestDto {
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  userId: string;
}
