import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StoreFilterInterceptor } from '../common/interceptors/store-filter.interceptor';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

@Controller('orders')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(StoreFilterInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    if (user.role === Role.STORE_OWNER && user.storeId) dto.storeId = user.storeId;
    return this.ordersService.create(dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('customerId') customerId?: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const storeId = user.role === Role.STORE_OWNER ? (user.storeId ?? undefined) : undefined;
    return this.ordersService.findAll({
      storeId,
      customerId,
      status,
      page: +page,
      limit: +limit,
    });
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    const storeId = user.role === Role.STORE_OWNER ? (user.storeId ?? undefined) : undefined;
    return this.ordersService.getStats(storeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
