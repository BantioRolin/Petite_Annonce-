import { HttpInterceptorFn } from '@angular/common/http';
import * as Sentry from '@sentry/angular';
import { tap } from 'rxjs/operators';

export const sentryHttpInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap({
      error: (error) => {
        Sentry.captureException(error);
      }
    })
  );
};
