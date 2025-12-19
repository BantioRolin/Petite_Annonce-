import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor global qui ajoute `withCredentials: true` à chaque requête HTTP.
 * Cela permet au navigateur d'envoyer les cookies de session (Set-Cookie) au backend
 * et de recevoir les cookies lors de la réponse (utile pour les sessions côté serveur).
 */
@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and set withCredentials to true.
    const cloned = req.clone({ withCredentials: true });
    return next.handle(cloned);
  }
}
