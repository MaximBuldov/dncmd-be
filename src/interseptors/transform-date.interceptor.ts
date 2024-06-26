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
    return next.handle().pipe(map((data) => this.transformDates(data)));
  }

  private transformDates(data: any, seen = new WeakSet()): any {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    if (seen.has(data)) {
      return data;
    }

    seen.add(data);

    if (Array.isArray(data)) {
      return data.map((item) => this.transformDates(item, seen));
    }

    const transformedObject = { ...data };
    for (const key in transformedObject) {
      if (transformedObject[key] instanceof Date) {
        transformedObject[key] = dayjs(transformedObject[key])
          .tz('America/Los_Angeles')
          .format();
      } else {
        transformedObject[key] = this.transformDates(
          transformedObject[key],
          seen
        );
      }
    }

    return transformedObject;
  }
}
