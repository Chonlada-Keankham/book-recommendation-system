import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { iUser } from './interface/user.interface';
import { Model } from 'mongoose';
import { UserStatus } from 'src/enum/user-status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<iUser>,
  ) {}


  async createOne(createUserDto: CreateUserDto): Promise<iUser> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { username: createUserDto.username },
        { phone: createUserDto.phone },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email, username, or phone already exists.');
    }

    const newUser = new this.userModel({
      ...createUserDto,
      status: UserStatus.ACTIVE,
      deleted_at: null,
    });

    return newUser.save();
  }

  async createMany(createUserDtos: CreateUserDto[]): Promise<iUser[]> {
    const emails = createUserDtos.map(dto => dto.email);
    const usernames = createUserDtos.map(dto => dto.username);
    const phones = createUserDtos.map(dto => dto.phone);
  
    const existingUsers = await this.userModel.find({
      $or: [
        { email: { $in: emails } },
        { username: { $in: usernames } },
        { phone: { $in: phones } },
      ],
    });
  
    if (existingUsers.length > 0) {
      throw new ConflictException('Email, username, or phone already exists.');
    }
  
    const createdUsers: iUser[] = [];
  
    for (const dto of createUserDtos) {
      const newUser = new this.userModel({
        ...dto,
        status: UserStatus.ACTIVE,
        deleted_at: null,
      });
  
      createdUsers.push(await newUser.save());
    }
  
    return createdUsers; 
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
    const user = await this.userModel.findOne({
      email: email,
      status: { $ne: UserStatus.DELETED }, 
      deleted_at: null, 
    }).exec();
  
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found or has been deleted.`);
    }
  
    return user;
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
  
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: updateUserDto.email, _id: { $ne: userId } },
        { username: updateUserDto.username, _id: { $ne: userId } },
        { phone: updateUserDto.phone, _id: { $ne: userId } },
      ],
    });
  
    if (existingUser) {
      throw new ConflictException('Email, username, or phone already exists.');
    }
  
    Object.assign(user, updateUserDto);
    user.updated_at = new Date(); 
  
    return user.save(); 
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
