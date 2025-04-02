import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";
import { Document } from "mongoose";
import { Status } from "src/enum/status.enum";
import { UserRole } from "src/enum/user-role.enum";

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    set: (value: string) => {
      if (/^[a-zA-Z]+$/.test(value)) {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }
      return value;
    },
  })
  first_name: string;

  @Prop({
    required: true,
    set: (value: string) => {
      if (/^[a-zA-Z]+$/.test(value)) {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }
      return value;
    },
  })
  last_name: string;
  @Prop({ required: true, validate: /^\d{10}$/ })
  phone: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: 'Invalid email format.',
    },
    set: (value: string) => value.toLowerCase(),
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number.' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character.' })
  @Transform(({ value }) => value?.trim())
  password: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return v.length >= 3 && v.length <= 20;
      },
      message: 'Username must be between 3 and 20 characters long.',
    },
  })

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString()
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters long.' })
  username: string;


@Prop({ enum: UserRole, required: true, default: UserRole.MEMBER })
role: UserRole;

@Prop({ enum: Status, default: Status.ACTIVE })
status: Status;

@Prop({ type: Date, default: null })
deleted_at ?: Date; 

@Prop({
  required: function() { return this.role === UserRole.EMPLOYEE },
  unique: true,
})
employeeId?: string;

@Prop({ default: null })
profileImage?: string;

@Prop({ default: null })
backgroundImage?: string;


}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);


