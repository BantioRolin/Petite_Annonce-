import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Sentry from "@sentry/angular";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = environment.BACKURL;

  constructor(private http: HttpClient) {}

  /** -------- INSCRIPTION -------- */
  register(data: { name: string; email: string; password: string }): Observable<any> {
    // withCredentials is handled by the global interceptor
    return this.http.post(`${this.API_URL}/auth/register`, data);
  }

  /** -------- CONNEXION -------- */
  login(data: { email: string; password: string }): Observable<any> {
    // withCredentials is set globally by the interceptor so the session cookie
    // from the backend will be accepted by the browser.
    return this.http.post(`${this.API_URL}/auth/login`, data).pipe(
      tap((res: any) => {
        if (res && typeof res === 'object') {
          // store minimal user info in localStorage for UI state
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  /** -------- DÉCONNEXION -------- */
  logout(): void {
    // Call backend to clear the session cookie (if backend exposes /auth/logout)
    // We don't wait for the response here, but ensure the cookie is requested to be cleared.
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe({
      next: () => {
        localStorage.removeItem('user');
        Sentry.setUser(null);
      },
      error: () => {
        // even on error, remove local state
        localStorage.removeItem('user');
      }
    });
  }

  /** -------- UTILISATEUR CONNECTÉ ? -------- */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  /** -------- UTILISATEUR COURANT -------- */
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;

    Sentry.setUser(parsedUser ? {
      id: parsedUser.id,
      email: parsedUser.email,
    } : null);

    return parsedUser;
  }
}

