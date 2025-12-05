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

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, data);
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
