import { extname } from 'path';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile-user.dto';
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { UserInterestDto } from './dto/interest-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }


  // ---------- Register ----------
  @Post('/register-member')
  async registerMember(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.registerMember(registerUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user
    };
  }

  @Post('/register-employee')
  @ApiOperation({ summary: 'Register new employee' })
  async registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    const { user, password } = await this.userService.registerEmployee(createEmployeeDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Employee registered successfully',
      data: {
        employee: user,
        initialPassword: password,
      },
    };
  }

  // ---------- Get ----------
  @Get('/find-one/:id')
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    const { password, ...userWithoutPassword } = user;
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: userWithoutPassword
    };
  }

  @Get('/find-email/:email')
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);
    const { password, ...userWithoutPassword } = user;
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: userWithoutPassword
    };
  }

  @Get('/find-all')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.userService.findAll(page, limit);
    const usersWithoutPassword = result.users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data: usersWithoutPassword,
      total: result.total
    };
  }

  // ---------- Update ----------
  @Put('/update-interests/:id')
  @ApiOperation({ summary: 'Update user interests and generate playlist' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Interests updated and playlist generated successfully.'
  })
  async updateInterests(
    @Param('id') userId: string,
    @Body() interestDto: UserInterestDto
  ) {
    const playlist = await this.userService.updateInterests(
      userId,
      interestDto.categories,
      interestDto.authors
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Interests updated and playlist generated successfully',
      data: playlist,
    };
  }


  // ---------- Upload ----------
  @Put('/update-profile/:id')
  @ApiOperation({ summary: 'Update user profile and upload profile image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profile',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
  }))
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const profileFilename = file?.filename;

    const user = await this.userService.updateUserProfile(id, updateProfileDto, profileFilename);

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: user,
    };
  }
  
  // ---------- Delete ----------
  @Delete('/soft-delete/:id')
  async softDelete(@Param('id') id: string) {
    const user = await this.userService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User soft deleted successfully',
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
}

