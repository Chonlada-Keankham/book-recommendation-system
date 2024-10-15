import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as bcrypt from 'bcrypt';
import { UserRole } from "src/enum/user-role.enum";
import { UserStatus } from "src/enum/user-status.enum"; 

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, validate: /^\d{10}$/ })
  phone: string;

  @Prop({ 
    required: true, 
    unique: true, 
    validate: {
      validator: (v: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ enum: UserRole, required: true })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE }) 
  status: UserStatus;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
  
  @Prop({ type: Date, default: null }) 
  deleted_at?: Date; 
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', function (next) {
  if (!this.isModified('updated_at')) {
    this.updated_at = new Date(); 
  }
  next();
});
