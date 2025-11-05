import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  RouteReuseStrategy,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { CustomRouteReuseStrategy } from './route-reuse-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes, withViewTransitions()),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
  ],
};
