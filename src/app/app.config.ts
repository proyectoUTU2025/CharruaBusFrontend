import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/auth/auth.interceptor';
import { LoginService } from './services/login.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { SpanishPaginatorIntl } from './shared/spanish-paginator-intl';
import { CookieService } from 'ngx-cookie-service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(withInterceptorsFromDi()),
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    LoginService,
    {
      provide: MatPaginatorIntl,
      useValue: SpanishPaginatorIntl
    }
  ]
};
