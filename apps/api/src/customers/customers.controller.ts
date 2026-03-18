import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StoreFilterInterceptor } from '../common/interceptors/store-filter.interceptor';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';

@Controller('customers')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(StoreFilterInterceptor)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: User) {
    // STORE_OWNER: force storeId to their own store
    if (user.role === Role.STORE_OWNER && user.storeId) {
      dto.storeId = user.storeId;
    }
    return this.customersService.create(dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const storeId =
      user.role === Role.STORE_OWNER ? (user.storeId ?? undefined) : undefined;
    return this.customersService.findAll({ storeId, search, page: +page, limit: +limit });
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    const storeId =
      user.role === Role.STORE_OWNER ? (user.storeId ?? undefined) : undefined;
    return this.customersService.getStats(storeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(id);
  }
}
