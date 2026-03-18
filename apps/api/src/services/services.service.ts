import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateServiceDto } from './dto/create-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'
import { Service } from './service.entity'

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>
  ) {}

  create(dto: CreateServiceDto): Promise<Service> {
    return this.serviceRepo.save(this.serviceRepo.create(dto))
  }

  async findAll(storeId?: string): Promise<Service[]> {
    return this.serviceRepo.find({
      where: storeId ? { storeId } : {},
      order: { name: 'ASC' }
    })
  }

  async findOne(id: string): Promise<Service> {
    const svc = await this.serviceRepo.findOne({ where: { id } })
    if (!svc) throw new NotFoundException(`Service ${id} not found`)

    return svc
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const svc = await this.findOne(id)
    Object.assign(svc, dto)

    return this.serviceRepo.save(svc)
  }

  async remove(id: string): Promise<{ message: string }> {
    const svc = await this.findOne(id)
    await this.serviceRepo.remove(svc)

    return { message: `Service ${id} deleted` }
  }
}
