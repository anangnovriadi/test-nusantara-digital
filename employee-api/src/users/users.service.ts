import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  create(user: Partial<User>) {
    return this.repo.save(user);
  }

  async updateProfile(email: string, data: { fullname: string }) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    user.fullname = data.fullname;
    const { password, ...result } = await this.repo.save(user);
    return result;
  }
}
