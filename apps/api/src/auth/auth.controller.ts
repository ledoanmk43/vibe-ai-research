import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import type { Request } from 'express'
import type { App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthGuard } from '../common/guards/auth.guard'
import { User } from '../users/user.entity'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: App
  ) {}

  /**
   * POST /auth/login
   * Called by the frontend after Firebase client auth completes.
   */
  @Post('login')
  async login(@Req() req: Request, @Body() dto: LoginDto) {
    const authHeader = req.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header')
    }
    const token = authHeader.split('Bearer ')[1]

    try {
      const auth = getAuth(this.firebaseApp)
      const decoded = await auth.verifyIdToken(token)
      const user = await this.authService.findOrCreateUser(decoded.uid, dto)
      return { data: this.sanitizeUser(user), message: 'Login successful' }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Invalid or expired Firebase ID token')
    }
  }

  /**
   * GET /auth/me
   */
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    const fullUser = await this.authService.getMe(user)
    return { data: this.sanitizeUser(fullUser), message: 'Profile retrieved' }
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      storeId: user.storeId,
      store: user.store ? { id: user.store.id, name: user.store.name } : null,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  }
}
