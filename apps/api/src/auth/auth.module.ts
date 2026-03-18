import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthGuard } from '../common/guards/auth.guard'
import { Store } from '../stores/store.entity'
import { User } from '../users/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Store])],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard, AuthService, TypeOrmModule]
})
export class AuthModule {}
