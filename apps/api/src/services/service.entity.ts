import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { UnitType } from '../common/enums/unit-type.enum'
import { OrderItem } from '../orders/order-item.entity'
import { Store } from '../stores/store.entity'

@Entity('services')
@Index(['storeId', 'name'], { unique: true })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'enum', enum: UnitType, name: 'unit_type' })
  unitType: UnitType

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_unit' })
  pricePerUnit: number

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Store, (store) => store.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store

  @OneToMany(() => OrderItem, (orderItem) => orderItem.service)
  orderItems: OrderItem[]
}
