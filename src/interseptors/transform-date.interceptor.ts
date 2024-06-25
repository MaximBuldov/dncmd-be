import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TransformDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.transformDates(data);
      })
    );
  }

  private transformDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformDates(item));
    } else if (typeof data === 'object' && data !== null) {
      const transformedObject = { ...data };
      for (const key in transformedObject) {
        if (transformedObject[key] instanceof Date) {
          transformedObject[key] = dayjs(transformedObject[key])
            .tz('America/Los_Angeles')
            .format();
        } else if (typeof transformedObject[key] === 'object') {
          transformedObject[key] = this.transformDates(transformedObject[key]);
        }
      }
      return transformedObject;
    }
    return data;
  }
}
