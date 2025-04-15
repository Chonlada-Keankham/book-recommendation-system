import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePlaylistDto {
  @IsOptional()
  @IsArray({ message: 'Categories must be an array.' })
  @IsString({ each: true, message: 'Each category must be a string.' })
  categories?: string[];

  @IsOptional()
  @IsArray({ message: 'Authors must be an array.' })
  @IsString({ each: true, message: 'Each author must be a string.' })
  authors?: string[];
}
