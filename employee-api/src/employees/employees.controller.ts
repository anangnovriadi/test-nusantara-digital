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
        data: {
          id: 'uuid',
          name: 'Alex Santoso',
          age: 30,
          position: 'Sales Executive',
          salary: '15000000.00',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
      },
    },
  })
  async create(@Body() body: CreateEmployeeDto) {
    const employee = await this.service.create(body);
    return { data: employee };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee list',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Alex Santoso',
            age: 30,
            position: 'Sales Executive',
            salary: '15000000.00',
          },
        ],
        total: 1
      },
    },
  })
  async findAll() {
    const employees = await this.service.findAll();
    return {
      data: employees,
      total: employees.length,
    };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee detail',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'Alex Santoso',
          age: 30,
          position: 'Sales Executive',
          salary: '15000000.00',
        },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    const employee = await this.service.findOne(id);
    return { data: employee };
  }

  @Put(':id')
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully updated',
    schema: {
      example: { data: { message: 'Employee updated successfully' } },
    },
  })
  async update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    await this.service.update(id, body);
    return { data: { message: 'Employee updated successfully' } };
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Employee successfully deleted',
    schema: {
      example: { data: { message: 'Employee deleted successfully' } },
    },
  })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { data: { message: 'Employee deleted successfully' } };
  }
}
