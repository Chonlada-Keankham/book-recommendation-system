import { IsArray, IsString } from 'class-validator';

export class UserInterestDto {

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsArray()
  @IsString({ each: true })
  authors: string[];
}
