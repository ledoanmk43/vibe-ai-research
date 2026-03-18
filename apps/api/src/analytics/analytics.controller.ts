import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';
import { StoreFilterInterceptor } from '../common/interceptors/store-filter.interceptor';

@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(StoreFilterInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: User) {
    const storeId = user.role === Role.STORE_OWNER ? (user.storeId ?? undefined) : undefined;
    return this.analyticsService.getDashboardKpis(storeId);
  }
}
