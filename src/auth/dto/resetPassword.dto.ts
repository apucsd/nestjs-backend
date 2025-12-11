import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'New password is required' })
  newPassword: string;
  @IsString({ message: 'Reset token is required' })
  resetToken: string;
}
