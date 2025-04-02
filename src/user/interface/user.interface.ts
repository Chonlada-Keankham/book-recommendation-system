import { Status } from "src/enum/status.enum";
import { UserRole } from "src/enum/user-role.enum";

export interface iUser {
    _id?: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    username: string;
    role: UserRole;
    status: Status;
    employeeId?: string;
    profileImage?: string;
    backgroundImage?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
