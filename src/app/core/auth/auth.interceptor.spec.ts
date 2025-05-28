import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { LoginService } from '../../services/login.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let next: HttpHandler;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj('LoginService', [], { token: 'test-token' });
    next = jasmine.createSpyObj('HttpHandler', ['handle']);
    (next.handle as jasmine.Spy).and.returnValue(of());
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: LoginService, useValue: loginServiceSpy }
      ]
    });
    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when token is present', () => {
    const req = new HttpRequest('GET', '/test');
    interceptor.intercept(req, next).subscribe();
    const interceptedReq = (next.handle as jasmine.Spy).calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(interceptedReq.headers.get('Authorization')).toBe('Bearer test-token');
  });
});
