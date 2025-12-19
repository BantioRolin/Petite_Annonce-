import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './Service/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // register HttpClientModule so HttpClient is available for standalone bootstrap
    importProvidersFrom(HttpClientModule),
    // register our interceptor to add withCredentials to all requests
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true }
  ]
};
