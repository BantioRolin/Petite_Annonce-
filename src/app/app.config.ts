import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import * as Sentry from "@sentry/angular";
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CredentialsInterceptor } from './interceptor/credentials.interceptor';
import { sentryHttpInterceptor } from './interceptor/sentryHttpInterceptor.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // register HttpClientModule so HttpClient is available for standalone bootstrap
    importProvidersFrom(HttpClientModule),
    // register our interceptor to add withCredentials to all requests
    provideHttpClient(
      withInterceptors([sentryHttpInterceptor])),

      {
        provide:
      HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true,
      },
      {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
      },
      {
        provide: Sentry.TraceService,
        deps: [Router],
      },
      {
        provide: APP_INITIALIZER,
        useFactory: () => () => {},
        deps: [Sentry.TraceService],
        multi: true,
      }    
    
  ]
};