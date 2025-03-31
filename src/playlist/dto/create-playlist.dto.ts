import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlaylistDto {
  @IsNotEmpty({ message: 'User is required.' })
  @IsMongoId({ message: 'User ID must be a valid ObjectId.' })
  user: Types.ObjectId;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsArray()
  @IsString({ each: true })
  authors: string[];
}
