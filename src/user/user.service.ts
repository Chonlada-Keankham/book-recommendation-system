import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { iUser } from './interface/user.interface';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { Status } from 'src/enum/status.enum';
import { UserRole } from 'src/enum/user-role.enum';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
@Injectable()
export class UserService {

  constructor(
    @InjectModel('User')
    private readonly userModel: Model<iUser>,
  ) { }

  async checkUserExists(updateUserDto: UpdateUserDto, userId?: string): Promise<void> {
    const filter: any = { _id: { $ne: userId } };

    if (updateUserDto.email && updateUserDto.email.trim() !== '') {
        filter['email'] = updateUserDto.email.trim();
    }

    if (updateUserDto.username && updateUserDto.username.trim() !== '') {
        filter['username'] = updateUserDto.username.trim();
    }

    if (Object.keys(filter).length <= 1) return;

    const user = await this.userModel.findOne(filter);

    if (user) {
        throw new ConflictException('User with this email or username already exists.');
    }
}


  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async generateEmployeeId(): Promise<string> {
    const prefix = 'CKN';
    const random = Math.floor(100000 + Math.random() * 900000); 
    const employeeId = `${prefix}${random}`;

    const exists = await this.userModel.findOne({ employeeId });
    if (exists) return this.generateEmployeeId();

    return employeeId;
  }

  async generateRandomPassword(length: number = 8): Promise<string> {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;

    if (length < 4) {
        throw new Error('Password length must be at least 4 characters to include all character types.');
    }

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

  async registerMember(registerUserDto: RegisterUserDto): Promise<iUser> {
    try {
      await this.checkUserExists(registerUserDto);

      const hashedPassword = await this.hashPassword(registerUserDto.password);

      const newUser = new this.userModel({
        ...registerUserDto,
        password: hashedPassword,
        deleted_at: null,
      });

      return await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email or username already exists.');
      }
      console.error('User creation failed:', error);
      throw new InternalServerErrorException(`User creation failed: ${error.message}`);
    }
  }

  async registerEmployee(createEmployeeDto: CreateEmployeeDto): Promise<{ user: iUser; password: string }> {
    try {
      await this.checkUserExists(createEmployeeDto);

      const randomPassword = await this.generateRandomPassword();
      const hashedPassword = await this.hashPassword(randomPassword);

      const username = createEmployeeDto.username || `${createEmployeeDto.first_name.toLowerCase()}${createEmployeeDto.last_name.toLowerCase()}`;
      const employeeId = await this.generateEmployeeId(); // ✅

      const newUser = new this.userModel({
        ...createEmployeeDto,
        password: hashedPassword,
        username: username,
        role: UserRole.EMPLOYEE,
        employeeId: employeeId, 
        deleted_at: null,
      });

      const createdUser = await newUser.save();
      return { user: createdUser, password: randomPassword };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email or username already exists.');
      }
      throw new InternalServerErrorException(`User creation failed: ${error.message}`);
    }
  }

  async findByEmployeeId(employeeId: string): Promise<iUser | null> {
    return this.userModel.findOne({
      employeeId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();
  }

  async findOneById(id: string): Promise<iUser> {
    const user = await this.userModel.findOne({
      _id: id,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or has been deleted.`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<iUser> {
    try {
      const user = await this.userModel.findOne({
        email,
        status: { $ne: Status.DELETED },
        deleted_at: null,
      }).exec();

      console.log('User found in database:', user);

      if (!user) {
        throw new NotFoundException('User not found or has been deleted.');
      }

      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new InternalServerErrorException('Error retrieving user from the database');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: iUser[], total: number }> {
    const skip = (page - 1) * limit;
    const total = await this.userModel.countDocuments({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });

    const users = await this.userModel.find(
      { status: { $ne: Status.DELETED }, deleted_at: null },
    )
      .skip(skip)
      .limit(limit)
      .exec();

    return { users, total };
  }

  async updateOne(userId: string, updateUserDto: UpdateUserDto): Promise<iUser> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkUserExists(updateUserDto, userId); 

    const updatedUser = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          ...updateUserDto,
          updated_at: new Date(),
          password: updateUserDto.password ? await bcrypt.hash(updateUserDto.password, 10) : user.password,
        },
      },
    );

    if (updatedUser.modifiedCount === 0) {
      throw new InternalServerErrorException('Failed to update user');
    }

    return await this.userModel.findById(userId);
}

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }

    if (result.modifiedCount === 0) {
      throw new BadRequestException('Failed to update password');
    }
  }

  async uploadProfileImage(userId: string, filename: string): Promise<iUser> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.profileImage = `/uploads/profile/${filename}`;
    return user.save();
}

async uploadBackgroundImage(userId: string, filename: string): Promise<iUser> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.backgroundImage = `/uploads/background/${filename}`;
    return user.save();
}

  async softDelete(userId: string): Promise<iUser> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === Status.DELETED) {
      throw new ConflictException('User is already deleted');
    }

    user.status = Status.DELETED;
    user.deleted_at = new Date();

    return user.save();
  }

  async deleteById(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.deleteOne({ _id: userId });
    return true;
  }
}
