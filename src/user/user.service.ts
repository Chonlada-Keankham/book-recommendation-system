import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { iUser } from './interface/user.interface';
import { Model } from 'mongoose';
import { UserStatus } from 'src/enum/user-status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10;

  constructor(
    @InjectModel('User') 
    private readonly userModel: Model<iUser>,
  ) {}

  private async checkUserExists(userDto: Partial<CreateUserDto>): Promise<void> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: userDto.email },
        { username: userDto.username },
        { phone: userDto.phone },
      ],
    });

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

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      deleted_at: null,
    });

    return await newUser.save();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
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

    await this.checkUserExists(updateUserDto);

    Object.assign(user, updateUserDto);
    user.updated_at = new Date();

    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password); 
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
