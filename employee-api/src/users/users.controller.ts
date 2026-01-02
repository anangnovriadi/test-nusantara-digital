import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.usersService.findByEmail(req.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        const { password, ...result } = user;
        return result;
    }

    @Put('profile')
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.email, updateProfileDto);
    }
}
