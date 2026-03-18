import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from '../enums/role.enum';
import { AuthRequest } from '../guards/auth.guard';

@Injectable()
export class StoreFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    const storeId = user?.store?.id || user?.storeId;

    if (user && user.role === Role.STORE_OWNER && storeId) {
      // Inject store_id into query and body so service layer can scope queries
      if (!request.query) request.query = {};
      request.query.storeId = storeId;
      
      if (request.body && typeof request.body === 'object') {
        request.body.storeId = storeId;
      }
    }

    return next.handle();
  }
}
