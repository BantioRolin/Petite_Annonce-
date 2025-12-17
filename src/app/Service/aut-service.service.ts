import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = environment.BACKURL;

  constructor(private http: HttpClient) {}

  /** -------- INSCRIPTION -------- */
  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data);
  }

  /** -------- CONNEXION -------- */
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, data).pipe(
      tap((res: any) => {
        if (res && typeof res === 'object') {
          // on stocke l'utilisateur
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  /** -------- DÉCONNEXION -------- */
  logout(): void {
    localStorage.removeItem('user');
  }

  /** -------- UTILISATEUR CONNECTÉ ? -------- */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  /** -------- UTILISATEUR COURANT -------- */
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

