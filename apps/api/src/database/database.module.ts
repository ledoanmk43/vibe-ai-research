import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Store } from '../stores/store.entity';
import { User } from '../users/user.entity';
import { Customer } from '../customers/customer.entity';
import { Service } from '../services/service.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        const useSsl = config.get<boolean>('DB_SSL');

        return {
          type: 'postgres',
          ...(url ? { url } : {
            host: config.get<string>('DB_HOST'),
            port: config.get<number>('DB_PORT'),
            username: config.get<string>('DB_USERNAME'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>('DB_NAME'),
          }),
          synchronize: config.get<boolean>('DB_SYNCHRONIZE'),
          logging: config.get<boolean>('DB_LOGGING'),
          entities: [Store, User, Customer, Service, Order, OrderItem],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
