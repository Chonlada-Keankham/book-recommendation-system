import { Roles } from 'src/decorator/roles.decorator';
import { extname } from 'path';
import { UserService } from './user.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile-user.dto';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors, UseGuards, ForbiddenException, Req } from '@nestjs/common';
import { diskStorage } from 'multer';
import { UserInterestDto } from './dto/interest-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { UserRole } from 'src/enum/user-role.enum';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ---------- Register ----------
  @Post('/register-member')
  @ApiOperation({ summary: 'Register new member' })
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
      data: { employee: user, initialPassword: password },
    };
  }

  // ---------- Get ----------
  @UseGuards(JwtAuthGuard)
  @Get('/find-one/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    const { password, refreshToken, ...userWithoutSensitiveInfo } = user.toObject();
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: userWithoutSensitiveInfo,
    };
  }

  @Get('/find-email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);
    const { password, ...userWithoutPassword } = user;
    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: userWithoutPassword
    };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @Get('/find-all')
  @ApiOperation({ summary: 'Get all users (Employee only)' })
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
  @ApiOperation({ summary: 'Update user interests' })
  async updateInterests(
    @Param('id') id: string,
    @Body() interestDto: UserInterestDto
  ) {
    const playlist = await this.userService.updateInterests(
      id,
      interestDto.categories,
      interestDto.authors,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Interests updated successfully',
      data: playlist,
    };
  }

  // ---------- Upload ----------
  @Put('/update-profile/:id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user profile and upload profile image' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profile',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
  }))
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const user = await this.userService.updateUserProfile(id, updateProfileDto, file?.filename);

    const { password, refreshToken, ...userWithoutSensitiveInfo } = user.toObject();

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: userWithoutSensitiveInfo,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('/reset-password/:employeeId')
  @ApiOperation({ summary: 'Reset employee password by admin' })
  async resetEmployeePassword(
    @Param('employeeId') employeeId: string,
    @Body('newPassword') newPassword: string,
  ) {
    const user = await this.userService.resetEmployeePasswordByAdmin(employeeId, newPassword);

    return {
      statusCode: HttpStatus.OK,
      message: 'Password reset successfully',
      data: {
        employeeId: user.employeeId,
        username: user.username,
        email: user.email,
      },
    };
  }

  // ---------- Delete ----------
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Delete('/soft-delete/:id')
  @ApiOperation({ summary: 'Soft delete user' })
  async softDelete(@Param('id') id: string) {
    const user = await this.userService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User soft deleted successfully',
      data: user
    };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('/delete-one/:id')
  @ApiOperation({ summary: 'Delete user permanently' })
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

