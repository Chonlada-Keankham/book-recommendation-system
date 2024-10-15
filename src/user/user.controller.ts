import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Controller('user')
export class UserController {
  
  constructor(private readonly userService: UserService) {}

  @Post('create-one')
  async createOne(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.userService.createOne(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Created User Success',
      data: createdUser,
    };
  }

  @Post('create-many')
  async createMany(@Body() createUserDtos: CreateUserDto[]) {
    const createdUsers = await this.userService.createMany(createUserDtos);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Created Users Success',
      data: createdUsers,
    };
  }

  @Get('findone/:id')
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user,
    };
  }
  
  @Get('find-all')
async findAll() {
  const users = await this.userService.findAll();
  return {
    statusCode: HttpStatus.OK,
    message: 'Users found',
    data: users,
  };
}

@Put('update-one/:id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateOne(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }
  
  @Delete('delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async deleteById(@Param('id') id: string) {
    await this.userService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
    };
  }

  @Delete('soft-delete/:id')
  async softDelete(@Param('id') id: string) {
    const softDeletedUser = await this.userService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User soft deleted successfully',
      data: softDeletedUser,
    };
  }
}
