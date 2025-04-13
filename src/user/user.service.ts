import { PlaylistService } from 'src/playlist/playlist.service';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { iUser } from './interface/user.interface';
import { Model, Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-member-user.dto';
import { Status } from 'src/enum/status.enum';
import { UserRole } from 'src/enum/user-role.enum';
import { CreateEmployeeDto } from './dto/register-employee-user.dto';
import { iPlaylist } from 'src/playlist/interface/playlist.interface';
import { UpdateProfileDto } from './dto/update-profile-user.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectModel('User')
    private readonly userModel: Model<iUser>,
    private readonly playlistService: PlaylistService,
  ) { }

  // -------------------------------------------------------------------
  // 🔸 UTILITIES
  // -------------------------------------------------------------------

  async checkUserExists(
    updateUserDto: UpdateUserDto | RegisterUserDto | CreateEmployeeDto,
    userId?: string): Promise<void> {
    const filter: any[] = [];

    if (updateUserDto.email) filter.push({ email: updateUserDto.email });
    if (updateUserDto.username) filter.push({ username: updateUserDto.username });
    if (updateUserDto.phone) filter.push({ phone: updateUserDto.phone });
    if (filter.length === 0) return;

    const condition: any = { $or: filter };
    if (userId) condition._id = { $ne: userId };

    const user = await this.userModel.findOne(condition);
    if (user) throw new ConflictException('Email, username, or phone number already exists.');
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
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

    if (length < 4) throw new Error('Password length must be at least 4 characters.');

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

  // -------------------------------------------------------------------
  // 🔸 CREATE
  // -------------------------------------------------------------------

  async registerMember(registerUserDto: RegisterUserDto): Promise<iUser> {
    await this.checkUserExists(registerUserDto);
    const hashedPassword = await this.hashPassword(registerUserDto.password);
    const newUser = new this.userModel({
      ...registerUserDto,
      password: hashedPassword,
      deleted_at: null,
    });
    return await newUser.save();
  }

  async registerEmployee(createEmployeeDto: CreateEmployeeDto): Promise<{ user: iUser; password: string }> {
    await this.checkUserExists(createEmployeeDto);
    const randomPassword = await this.generateRandomPassword();
    const hashedPassword = await this.hashPassword(randomPassword);
    const username = createEmployeeDto.username || `${createEmployeeDto.first_name.toLowerCase()}${createEmployeeDto.last_name.toLowerCase()}`;
    const employeeId = await this.generateEmployeeId();

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
  }

  // -------------------------------------------------------------------
  // 🔸 READ
  // -------------------------------------------------------------------

  async findByEmployeeId(employeeId: string): Promise<iUser> {
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

    if (!user) throw new NotFoundException(`User with ID ${id} not found or has been deleted.`);
    return user;
  }

  async findOneByEmail(email: string): Promise<iUser> {
    const user = await this.userModel.findOne({
      email,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();

    if (!user) throw new NotFoundException('User not found or has been deleted.');
    return user;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: iUser[],
    total: number
  }> {
    const skip = (page - 1) * limit;
    const total = await this.userModel.countDocuments({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });
    const users = await this.userModel.find(
      { status: { $ne: Status.DELETED }, deleted_at: null },
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { users, total };
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE
  // -------------------------------------------------------------------
  async updatePassword(
    userId: string,
    hashedPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = hashedPassword;
    await user.save();
  }

  async updateUserRefreshToken(
    userId: string,
    refreshToken: string | null): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshToken } }
    );
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    profileFilename?: string
  ): Promise<iUser> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.first_name = updateProfileDto.first_name || user.first_name;
    user.last_name = updateProfileDto.last_name || user.last_name;
    user.phone = updateProfileDto.phone || user.phone;
    user.username = updateProfileDto.username || user.username;
    user.updated_at = new Date();

    if (profileFilename) {
      user.profileImage = `/uploads/profile/${profileFilename}`;
    }

    if (updateProfileDto.password) {
      if (updateProfileDto.password !== updateProfileDto.confirmPassword) {
        throw new BadRequestException('Password and Confirm Password do not match.');
      }

      user.password = await this.hashPassword(updateProfileDto.password);
    }

    return await user.save();
  }

  async updateInterests(
    userId: string,
    categories: string[],
    authors: string[]): Promise<iPlaylist> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let playlist = await this.playlistService.getPlaylist(userId).catch(() => null);

    if (!playlist) {
      playlist = await this.playlistService.createPlaylist({
        user: new Types.ObjectId(user._id),
        categories: categories,
        authors: authors
      });
    } else {
      playlist.categories = categories;
      playlist.authors = authors;
      playlist.recommendedBooks = await this.playlistService.generateRecommendations(categories, authors);
      await playlist.save();
    }

    return playlist;
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE
  // -------------------------------------------------------------------

  async softDelete(userId: string): Promise<iUser> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.status === Status.DELETED) throw new ConflictException('User is already deleted');

    user.status = Status.DELETED;
    user.deleted_at = new Date();
    return user.save();
  }

  async deleteById(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.userModel.deleteOne({ _id: userId });
    return true;
  }
}
