import { Injectable } from '@nestjs/common';
import { User } from './dtos/user.dto';

@Injectable()
export class UserService {
    register(user: User){

    }

    signIn(username: string, password: string){}

    changePassword(newPassword: string){}
}
