import { UserRole } from "src/enum/user-role.enum";
import { UserStatus } from "src/enum/user-status.enum";

export interface iUser {
    _id?: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    username: string;
    role: UserRole;
    status: UserStatus;
    created_at: Date;
    updated_at: Date; 
    deleted_at?: Date;
}
