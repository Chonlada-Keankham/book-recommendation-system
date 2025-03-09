import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { iUser } from './interface/user.interface';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/enum/user-role.enum';
import { UserDocument } from './schema/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { Status } from 'src/enum/status.enum';
@Injectable()
export class UserService {

  constructor(
    @InjectModel('User')
    private readonly userModel: Model<iUser>,
  ) { }

  async checkUserExists(updateUserDto: UpdateUserDto, userId?: string): Promise<void> {
    const filter = { _id: { $ne: userId } };
    if (updateUserDto.email) {
      filter['email'] = updateUserDto.email;
    }
    if (updateUserDto.username) {
      filter['username'] = updateUserDto.username;
    }
  
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

  async register (registerUserDto: RegisterUserDto): Promise<iUser> {
    try {
      await this.checkUserExists(registerUserDto);

      const hashedPassword = await this.hashPassword(registerUserDto.password);

      const newUser = new this.userModel({
        ...registerUserDto,
        password: hashedPassword,
        status: Status.ACTIVE,
        deleted_at: null,
        role: UserRole.MEMBER,
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

  async findOneById(id: string): Promise<UserDocument> {
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
    
    if (!user || user.status === Status.DELETED) {
      throw new NotFoundException('User not found or has been deleted.');
    }
  
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );
  
    if (result.modifiedCount === 0) {
      throw new InternalServerErrorException('Password update failed');
    }
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
  
  async deleteById(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.deleteOne({ _id: userId });
  }
}
