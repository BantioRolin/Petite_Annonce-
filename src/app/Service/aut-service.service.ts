import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = environment.BACKURL; 

  constructor(private http: HttpClient) {}

  /** -------------- INSCRIPTION -------------- **/
  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data);
  }

  /** -------------- CONNEXION -------------- **/
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  /** -------------- DÉCONNEXION -------------- **/
  logout(): void {
    localStorage.removeItem('token');
  }

  /** -------------- OBTENIR LE TOKEN -------------- **/
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** -------------- UTILISATEUR CONNECTÉ ? -------------- **/
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /** -------------- RÉCUPÉRER PROFIL USER -------------- **/
  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/me`);
  }
}
