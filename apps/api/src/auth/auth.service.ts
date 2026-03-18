import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from '../common/enums/role.enum'
import { Store } from '../stores/store.entity'
import { User } from '../users/user.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>
  ) {}

  /**
   * Find or create a user by firebase_uid.
   * Called after the client successfully authenticates with Firebase.
   */
  async findOrCreateUser(firebaseUid: string, dto: LoginDto): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { firebaseUid },
      relations: ['store']
    })

    if (!user) {
      // 1. Create a default store for the new owner
      const store = this.storeRepo.create({
        name: `${dto.displayName || 'My'}'s Laundry`
      })
      const savedStore = await this.storeRepo.save(store)

      // 2. Create the user and link to the store
      user = this.userRepo.create({
        firebaseUid,
        email: dto.email ?? '',
        displayName: dto.displayName ?? 'New User',
        phoneNumber: dto.phoneNumber,
        role: Role.STORE_OWNER,
        storeId: savedStore.id,
        isActive: true
      })
      user = await this.userRepo.save(user)
      user.store = savedStore
    }

    return user
  }

  async getMe(user: User): Promise<User> {
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['store']
    })

    // Self-healing: If user exists but somehow has no store, create one now
    if (fullUser && !fullUser.storeId && fullUser.role === Role.STORE_OWNER) {
      const store = this.storeRepo.create({
        name: `${fullUser.displayName || 'My'}'s Laundry`
      })
      const savedStore = await this.storeRepo.save(store)
      fullUser.storeId = savedStore.id
      fullUser.store = savedStore
      await this.userRepo.save(fullUser)
    }

    return fullUser
  }
}
