import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
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
  
  @Prop({ type: Date, default: null }) 
  deleted_at?: Date; 
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);


