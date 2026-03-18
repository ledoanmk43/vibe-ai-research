import { DataSource } from 'typeorm';
import { Store } from '../stores/store.entity';
import { User } from '../users/user.entity';
import { Customer } from '../customers/customer.entity';
import { Service } from '../services/service.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';

// This is used by the TypeORM CLI to generate and run migrations
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [Store, User, Customer, Service, Order, OrderItem],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
