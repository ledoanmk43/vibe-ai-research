import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { OrderStatus } from '../common/enums/order-status.enum';

export interface CustomerQuery {
  storeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepo.create(dto);
    return this.customerRepo.save(customer);
  }

  async findAll(query: CustomerQuery): Promise<{ data: Customer[]; meta: object }> {
    const { storeId, search, page = 1, limit = 20 } = query;

    const where: Record<string, unknown>[] = [];

    if (search) {
      const pattern = ILike(`%${search}%`);
      const base = storeId ? { storeId } : {};
      where.push(
        { ...base, name: pattern },
        { ...base, phone: pattern },
        { ...base, email: pattern },
      );
    } else {
      where.push(storeId ? { storeId } : {});
    }

    const [data, total] = await this.customerRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['store'],
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Customer & { totalOrders: number; totalSpent: number; loyaltyPoints: number }> {
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: ['store', 'orders'],
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);

    const completedOrders = (customer.orders || []).filter((o) => o.status === OrderStatus.COMPLETED);
    const totalOrders = customer.orders?.length || 0;
    const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const loyaltyPoints = Math.floor(totalSpent / 10000);

    return Object.assign(customer, {
      totalOrders,
      totalSpent,
      loyaltyPoints,
    });
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customerWithStats = await this.findOne(id);
    const customer = this.customerRepo.create({ ...customerWithStats, ...dto });
    return this.customerRepo.save(customer);
  }

  async remove(id: string): Promise<{ message: string }> {
    const customerWithStats = await this.findOne(id);
    await this.customerRepo.remove(customerWithStats);
    return { message: `Customer ${id} deleted` };
  }

  async getStats(storeId?: string): Promise<{ totalCustomers: number; newThisMonth: number }> {
    const base = storeId ? { storeId } : {};
    const totalCustomers = await this.customerRepo.count({ where: base });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await this.customerRepo
      .createQueryBuilder('c')
      .where(storeId ? 'c.store_id = :storeId' : '1=1', { storeId })
      .andWhere('c.created_at >= :startOfMonth', { startOfMonth })
      .getCount();

    return { totalCustomers, newThisMonth };
  }
}
