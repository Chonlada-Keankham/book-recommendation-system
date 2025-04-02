import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) { }

  @Post('/register-member')
  @ApiOperation({ summary: 'Register a new user' })
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
  @ApiOperation({ summary: 'Register a new employee and return email and password' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employee created successfully.'
  })

  @Post('/register-employee')
  @ApiOperation({ summary: 'Register a new employee and return employeeId & password' })
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
        password: password,
      },
    };
  }

  @Post('/upload/profile/:id')
  @ApiOperation({ summary: 'Upload profile image' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, process.env.PROFILE_PATH || './uploads/profile');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/image\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
  }))
  async uploadProfile(@Param('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.uploadProfile(userId, file.filename);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile image uploaded successfully',
      data: result,
    };
  }

  @Post('/upload/background/:id')
  @ApiOperation({ summary: 'Upload background image' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, process.env.BACKGROUND_PATH || './uploads/background');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/image\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
  }))
  async uploadBackground(@Param('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.uploadBackground(userId, file.filename);
    return {
      statusCode: HttpStatus.OK,
      message: 'Background image uploaded successfully',
      data: result,
    };
  }

  @Get('/find-one/:id')
  @ApiOperation({ summary: 'Find a user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found.'
  })
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Get('/find-email/:email')
  @ApiOperation({ summary: 'Find a user by email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found.'
  })
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: user
    };
  }

  @Get('/find-all')
  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users found.'
  })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.userService.findAll(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data: result.users,
      total: result.total
    };
  }

  @Put('/update-one/:id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully.'
  })
  async updateOne(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.updateOne(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: user
    };
  }

  @Delete('/delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully.'
  })
  async deleteById(@Param('id') id: string) {
    await this.userService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
      data: null
    };
  }

  @Delete('/soft-delete/:id')
  @ApiOperation({ summary: 'Soft delete a user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User soft deleted successfully.'
  })
  async softDelete(@Param('id') id: string) {
    const user = await this.userService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User soft deleted successfully',
      data: user
    };
  }
}
function diskStorage(arg0: { destination: string; filename: (req: any, file: any, cb: any) => void; }): any {
  throw new Error('Function not implemented.');
}

