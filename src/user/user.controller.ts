import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { iUser } from './interface/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,

  ) { }

  @Post('create-one')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully.' })
  async createOne(@Body() createUserDto: CreateUserDto): Promise<{ statusCode: number; message: string; data: iUser }> {
    const createdUser = await this.userService.createOne(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Created User Success',
      data: createdUser,
    };
  }



  @Get('find-one/:id')
  @ApiOperation({ summary: 'Find a user by ID' })
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user,
    };
  }

  @Get('find-email/:email')
  @ApiOperation({ summary: 'Find a user by email' })
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user,
    };
  }

  @Get('find-all')
  @ApiOperation({ summary: 'Find all users' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.userService.findAll(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data: result.users,
      total: result.total,
    };
  }
  
  @Put('update-one/:id')
  @ApiOperation({ summary: 'Update a user by ID' })
  async updateOne(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.updateOne(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  @Delete('delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  async deleteById(@Param('id') id: string) {
    await this.userService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
      data: null,
    };
  }
  
  @Delete('soft-delete/:id')
  @ApiOperation({ summary: 'Soft delete a user by ID' })
  async softDelete(@Param('id') id: string) {
    const softDeletedUser = await this.userService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User soft deleted successfully',
      data: softDeletedUser,
    };
  }
}
