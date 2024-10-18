import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { iUser } from './interface/user.interface';
import { Model } from 'mongoose';
import { UserStatus } from 'src/enum/user-status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<iUser>,
  ) { }

  private async checkUserExists(userDto: Partial<CreateUserDto>, userId?: string): Promise<void> {
    const query: any = {
      $or: [
        { email: userDto.email },
        { username: userDto.username },
        { phone: userDto.phone },
      ],
    };

    if (userId) {
      query._id = { $ne: userId };
    }

    const existingUser = await this.userModel.findOne(query).exec();

    if (existingUser) {
      let errorMessage = 'Email, username, or phone already exists.';
      if (existingUser.email === userDto.email) {
        errorMessage = 'Email already exists.';
      } else if (existingUser.username === userDto.username) {
        errorMessage = 'Username already exists.';
      } else if (existingUser.phone === userDto.phone) {
        errorMessage = 'Phone number already exists.';
      }
      throw new ConflictException(errorMessage);
    }
  }

  async createOne(createUserDto: CreateUserDto): Promise<iUser> {
    await this.checkUserExists(createUserDto);
  
    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
  
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,  // เก็บรหัสผ่านที่เข้ารหัส
      status: UserStatus.ACTIVE,
      deleted_at: null,
    });
  
    return await newUser.save(); // ใช้ await ที่นี่ต้องให้ฟังก์ชันเป็น async
  }

  
  async findOneById(id: string): Promise<iUser> {
    const user = await this.userModel.findOne({
      _id: id,
      status: { $ne: UserStatus.DELETED },
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
        status: { $ne: UserStatus.DELETED },
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

  async findAll(): Promise<iUser[]> {
    const users = await this.userModel.find({
      status: { $ne: UserStatus.DELETED },
      deleted_at: null,
    }).exec();

    if (users.length === 0) {
      throw new NotFoundException(`No users found.`);
    }

    return users;
  }

  async updateOne(userId: string, updateUserDto: UpdateUserDto): Promise<iUser> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkUserExists(updateUserDto, userId);

    Object.assign(user, updateUserDto);
    user.updated_at = new Date();

    if (updateUserDto.password) {
    }

    return await user.save();
  }

  async softDelete(userId: string): Promise<iUser> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.DELETED;
    user.deleted_at = new Date();

    return user.save();
  }

  async deleteById(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.deleteOne({ _id: userId });
  }
}
