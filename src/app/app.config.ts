import { CookieService } from 'ngx-cookie-service';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './services/auth.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { SpanishPaginatorIntl } from './shared/spanish-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule, FormsModule),
    provideHttpClient(withInterceptorsFromDi()),
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AuthService,
    {
      provide: MatPaginatorIntl,
      useValue: SpanishPaginatorIntl
    }
  ]
};
