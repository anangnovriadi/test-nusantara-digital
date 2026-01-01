import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@mail.com',
  })
  email: string;

  @ApiProperty({
    example: 'Admin123@',
  })
  password: string;
}
