import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Alex Santoso' })
  name: string;

  @ApiProperty({ example: 30 })
  age: number;

  @ApiProperty({ example: 'Sales Executive' })
  position: string;

  @ApiProperty({ example: 15000000 })
  salary: number;
}
