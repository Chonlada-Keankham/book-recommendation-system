import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlaylistDto {
  @IsNotEmpty({ message: 'User is required.' })
  @IsMongoId({ message: 'User ID must be a valid ObjectId.' })
  user: string;

  @IsArray({ message: 'Categories must be an array.' })
  @IsString({ each: true, message: 'Each category must be a string.' })
  categories: string[];

  @IsArray({ message: 'Authors must be an array.' })
  @IsString({ each: true, message: 'Each author must be a string.' })
  authors: string[];
}
