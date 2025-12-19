import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as Sentry from "@sentry/angular";
import { environment } from './environments/environment';

Sentry.init({
  dsn: environment.sentryDsn,

  sendDefaultPii: !environment.production,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Performance
  tracesSampleRate: environment.production ? 0.2 : 1.0,

  tracePropagationTargets: [
    'localhost',
    'cloudcomputingm4backend.onrender.com',
  ],

  // Session Replay
  replaysSessionSampleRate: environment.production ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,

  environment: environment.production ? 'production' : 'development',
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  