import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Service } from '../services/service.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../common/enums/order-status.enum';

export interface OrderQuery {
  storeId?: string;
  customerId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Service) private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('An order must contain at least one item');
    }

    // Fetch all services in a single query
    const serviceIds = dto.items.map((i) => i.serviceId);
    const services = await this.serviceRepo.findBy({ id: In(serviceIds) });
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Build OrderItem entities
    let subtotal = 0;
    const orderItems: DeepPartialOrderItem[] = dto.items.map((itemDto) => {
      const svc = serviceMap.get(itemDto.serviceId);
      if (!svc) throw new NotFoundException(`Service ${itemDto.serviceId} not found`);
      const unitPrice = itemDto.unitPrice ?? Number(svc.pricePerUnit);
      const lineSubtotal = unitPrice * itemDto.quantity;
      subtotal += lineSubtotal;
      return {
        serviceId: svc.id,
        quantity: itemDto.quantity,
        unitPrice,
        subtotal: lineSubtotal,
        notes: itemDto.notes ?? null,
      };
    });

    const totalAmount = Math.max(0, subtotal - (dto.discount ?? 0));

    // Generate a simple order number (or use a sequence in DB for production)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const order = new Order();
    order.orderNumber = orderNumber;
    order.storeId = dto.storeId;
    order.customerId = dto.customerId;
    order.status = OrderStatus.PENDING;
    order.notes = dto.notes ?? '';
    order.totalAmount = totalAmount;
    order.items = orderItems as unknown as OrderItem[];

    return this.orderRepo.save(order);
  }

  async findAll(query: OrderQuery): Promise<{ data: Order[]; meta: object }> {
    const { storeId, customerId, status, page = 1, limit = 20 } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (storeId) qb.andWhere('order.store_id = :storeId', { storeId });
    if (customerId) qb.andWhere('order.customer_id = :customerId', { customerId });
    if (status) qb.andWhere('order.status = :status', { status });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'store', 'items', 'items.service'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async getStats(storeId?: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    revenueThisMonth: number;
  }> {
    const base = storeId ? { storeId } : {};

    const totalOrders = await this.orderRepo.count({ where: base });
    const pendingOrders = await this.orderRepo.count({
      where: { ...base, status: OrderStatus.PENDING },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total_amount), 0)', 'total')
      .where(storeId ? 'o.store_id = :storeId' : '1=1', { storeId })
      .andWhere('o.status = :completed', { completed: OrderStatus.COMPLETED })
      .getRawOne<{ total: string }>();

    const monthlyResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total_amount), 0)', 'total')
      .where(storeId ? 'o.store_id = :storeId' : '1=1', { storeId })
      .andWhere('o.status = :completed', { completed: OrderStatus.COMPLETED })
      .andWhere('o.created_at >= :startOfMonth', { startOfMonth })
      .getRawOne<{ total: string }>();

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: Number.parseFloat(revenueResult?.total ?? '0'),
      revenueThisMonth: Number.parseFloat(monthlyResult?.total ?? '0'),
    };
  }
}

// Local type alias to avoid TypeORM DeepPartial complexity
interface DeepPartialOrderItem {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
}
