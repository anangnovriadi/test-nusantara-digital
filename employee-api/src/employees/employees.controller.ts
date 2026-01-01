import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Post()
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({
    status: 201,
    description: 'Employee successfully created',
    schema: {
      example: {
        id: 'uuid',
        name: 'Alex Santoso',
        age: 30,
        position: 'Sales Executive',
        salary: '15000000.00',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      },
    },
  })
  create(@Body() body: CreateEmployeeDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee list',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Alex Santoso',
          age: 30,
          position: 'Sales Executive',
          salary: '15000000.00',
        },
      ],
    },
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee detail',
    schema: {
      example: {
        id: 'uuid',
        name: 'Alex Santoso',
        age: 30,
        position: 'Sales Executive',
        salary: '15000000.00',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully updated',
  })
  update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Employee successfully deleted',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
