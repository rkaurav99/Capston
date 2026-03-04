import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * AuthInterceptor automatically attaches the JWT token
 * to every outgoing HTTP request's Authorization header.
 *
 * Flow:
 * 1. Angular HttpClient makes a request
 * 2. This interceptor catches it BEFORE it's sent
 * 3. It clones the request and adds "Authorization: Bearer <token>"
 * 4. The modified request is forwarded to the backend
 *
 * This eliminates the need to manually add headers in every service method.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // If we have a token, clone the request and add the Authorization header
    if (token) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(clonedReq);
    }

    // If no token, forward the original request unchanged (for login/register)
    return next.handle(req);
  }
}
