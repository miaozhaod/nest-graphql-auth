import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupUserInput } from './dto/signup-user.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    const valid = await bcrypt.compare(password, user?.password);

    if (user && valid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    return {
      access_token: this.jwtService.sign({
        username: user.username,
        sub: user.id,
      }),
      user,
    };
  }

  async signup(signupUserInput: SignupUserInput) {
    const { username } = signupUserInput;
    const user = await this.usersService.findOne(username);
    if (user) {
      throw new Error(`User ${username} already exists`);
    }

    const password = await bcrypt.hash(signupUserInput.password, 10);

    return this.usersService.create({
      ...signupUserInput,
      password,
    });
  }
}
