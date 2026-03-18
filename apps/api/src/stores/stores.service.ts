import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Store with name "${dto.name}" already exists`);
    }
    const store = this.storeRepo.create(dto);
    return this.storeRepo.save(store);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Store[]; meta: object }> {
    const [data, total] = await this.storeRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['users'],
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!store) throw new NotFoundException(`Store ${id} not found`);
    return store;
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    Object.assign(store, dto);
    return this.storeRepo.save(store);
  }

  async remove(id: string): Promise<{ message: string }> {
    const store = await this.findOne(id);
    await this.storeRepo.remove(store);
    return { message: `Store ${id} deleted` };
  }
}
