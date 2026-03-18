import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly customersService: CustomersService,
  ) {}

  async getDashboardKpis(storeId?: string) {
    const orderStats = await this.ordersService.getStats(storeId);
    const customerStats = await this.customersService.getStats(storeId);

    // Combining the KPIs for the Dashboard
    return {
      totalCustomers: customerStats.totalCustomers,
      activeOrders: orderStats.pendingOrders,
      revenueThisMonth: orderStats.revenueThisMonth,
      totalOrders: orderStats.totalOrders,
      newCustomersThisMonth: customerStats.newThisMonth,
      totalRevenue: orderStats.totalRevenue,
    };
  }
}
