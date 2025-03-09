import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required.' })
  @IsString({ message: 'Refresh token must be a string.' })
  @Length(1, 255, { message: 'Refresh token must be between 1 and 255 characters.' })
  refresh_token: string;
}
