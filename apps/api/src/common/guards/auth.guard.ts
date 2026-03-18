import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../../users/user.entity';
import type { Request } from 'express';

export interface AuthRequest extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: App,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const auth = getAuth(this.firebaseApp);
      const decoded = await auth.verifyIdToken(token);
      const user = await this.userRepo.findOne({
        where: { firebaseUid: decoded.uid },
        relations: ['store'],
      });

      if (!user) {
        throw new UnauthorizedException('User not registered in the system');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired Firebase ID token');
    }
  }
}
