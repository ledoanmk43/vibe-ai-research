import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from '../common/enums/role.enum'
import { User } from '../users/user.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

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
      user = this.userRepo.create({
        firebaseUid,
        email: dto.email ?? '',
        displayName: dto.displayName ?? 'New User',
        phoneNumber: dto.phoneNumber,
        role: Role.STORE_OWNER,
        isActive: true
      })
      user = await this.userRepo.save(user)
    }

    return user
  }

  async getMe(user: User): Promise<User> {
    return this.userRepo.findOne({
      where: { id: user.id },
      relations: ['store']
    })
  }
}
