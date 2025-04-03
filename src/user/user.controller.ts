import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProfileDto } from './dto/update-profile-user.dto';
import { UserInterestDto } from './dto/interest-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @Post('/register-member')
  @ApiOperation({ summary: 'Register a new member' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.'
  })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.registerMember(registerUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user
    };
  }

  @Post('/register-employee')
  @ApiOperation({ summary: 'Register a new employee' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employee created successfully.'
  })
  async registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    const { user, password } = await this.userService.registerEmployee(createEmployeeDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Employee created successfully',
      data: {
        employeeId: user.employeeId,
        password
      }
    };
  }

  @Post('/upload/profile/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfile(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.uploadProfileImage(userId, file.filename);
    return {
      statusCode: 200,
      message: 'Profile image uploaded',
      data: result
    };
  }

  @Post('/upload/background/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBackground(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.uploadBackgroundImage(userId, file.filename);
    return {
      statusCode: 200,
      message: 'Background image uploaded',
      data: result
    };
  }

  @Put('/update-interests/:id')
  async updateInterests(
    @Param('id') userId: string,
    @Body() interestDto: UserInterestDto
  ) {
    const playlist = await this.userService.updateInterests(userId, interestDto.categories, interestDto.authors);
    return {
      statusCode: HttpStatus.OK,
      message: 'Interests updated and playlist generated successfully',
      data: playlist,
    };
  }
  
  @Get('/find-one/:id')
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Get('/find-email/:email')
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Get('/find-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10) {
    const result = await this.userService.findAll(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data: result.users,
      total: result.total
    };
  }

  @Put('/update-one/:id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.updateOne(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: user
    };
  }

  @Patch('/update-profile/:id')
  async updateProfile(@Param('id') userId: string,
    @Body() dto: UpdateProfileDto) {
    const user = await this.userService.updateProfile(userId, dto);
    return {
      statusCode: 200,
      message: 'Profile updated',
      data: user
    };
  }

  @Delete('/delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id') id: string) {
    await this.userService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
      data: null
    };
  }

  @Delete('/soft-delete/:id')
  async softDelete(@Param('id') id: string) {
    const user = await this.userService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User soft deleted successfully',
      data: user
    };
  }
}
