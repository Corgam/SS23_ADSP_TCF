import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { Auth, idToken } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private readonly auth = inject(Auth);
  readonly idToken$ = idToken(this.auth);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.idToken$.pipe(
      take(1),
      switchMap((idToken: string | null) => {
        if (idToken) {
          const authReq = request.clone({
            setHeaders: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          return next.handle(authReq);
        } else {
          // If there's no idToken, proceed with the original request
          return next.handle(request);
        }
      })
    );
  }
}
