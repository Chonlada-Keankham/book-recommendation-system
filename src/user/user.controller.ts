import { extname } from 'path';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile-user.dto';
import { UserInterestDto } from './dto/interest-user.dto';
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';

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
  async registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    const { user, password } = await this.userService.registerEmployee(createEmployeeDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Employee created successfully',
      data: { employeeId: user.employeeId, password }
    };
  }

  // ---------- Get ----------
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

  // ---------- Update ----------
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
  async updateProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateProfileDto) {
    const user = await this.userService.updateProfile(userId, dto);
    return {
      statusCode: 200,
      message: 'Profile updated',
      data: user
    };
  }

  // ---------- Upload ----------
  @Post('/upload/profile/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profile', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } 
  }))
  async uploadProfile(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file || !file.filename) {
      throw new BadRequestException('File is missing or invalid.');
    }

    const result = await this.userService.uploadProfileImage(userId, file.filename);
    return {
      statusCode: 200,
      message: 'Profile image uploaded',
      data: result
    };
  }

  @Post('/upload/background/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/background', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, 
  }))
  async uploadBackground(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file || !file.filename) {
      throw new BadRequestException('File is missing or invalid.');
    }
  
    const result = await this.userService.uploadBackgroundImage(userId, file.filename);
    return {
      statusCode: 200,
      message: 'Background image uploaded',
      data: result
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

