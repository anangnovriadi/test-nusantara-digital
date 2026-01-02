import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty()
    fullname: string;
}
