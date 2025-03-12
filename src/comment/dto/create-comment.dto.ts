import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Status } from "src/enum/status.enum";

export class CreateCommentDto {
    @IsNotEmpty({ message: 'User is required.' })
    @IsMongoId({ message: 'Invalid user ID format.' })
    user: string;  

    @IsNotEmpty({ message: 'Username is required.' })
    @IsString({ message: 'Username must be a string.' })
    username: string;  

    @IsNotEmpty({ message: 'Book is required.' })
    @IsMongoId({ message: 'Invalid book ID format.' })
    book: string; 

    @IsNotEmpty({ message: 'Content is required.' })
    @IsString({ message: 'Content must be a string.' })
    content: string;  t

    @IsOptional()
    @IsEnum(Status, { message: 'Invalid status.' })
    status: Status = Status.ACTIVE;  

    @IsOptional()
    @IsString({ message: 'Deleted date must be a string.' })
    deleted_at?: string; 
}
