import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface Annonce {
  id?: number;
  titre: string;
  type: string;
  prix: number | null;
  description: string;
  ville: string;
  quartier: string;
  telephone: string;
  email: string;
  images: string[];
  date?: string;
  views?: number;
  statut?: string;
  userId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {
  private apiUrl = environment.BACKURL;
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Get all annonces with optional filters
   */
  getAnnonces(filters?: {
    type?: string;
    ville?: string;
    minPrix?: number;
    maxPrix?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<Annonce[]>> {
    let url = this.apiUrl;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      url += `?${params.toString()}`;
    }

    return this.http.get<ApiResponse<Annonce[]>>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get a single annonce by ID
   */
  getAnnonceById(id: number): Observable<ApiResponse<Annonce>> {
    return this.http.get<ApiResponse<Annonce>>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new annonce
   */
  createAnnonce(annonce: Annonce): Observable<ApiResponse<Annonce>> {
    return this.http.post<ApiResponse<Annonce>>(this.apiUrl, annonce, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing annonce
   */
  updateAnnonce(id: number, annonce: Partial<Annonce>): Observable<ApiResponse<Annonce>> {
    return this.http.put<ApiResponse<Annonce>>(`${this.apiUrl}/${id}`, annonce, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete an annonce
   */
  deleteAnnonce(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload images for an annonce
   */
  uploadImages(files: File[]): Observable<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const headers = new HttpHeaders({
      'Authorization': localStorage.getItem('authToken') ? 
        `Bearer ${localStorage.getItem('authToken')}` : ''
    });

    return this.http.post<ApiResponse<string[]>>(`${this.apiUrl}/upload`, formData, { 
      headers 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Increment view count for an annonce
   */
  incrementViews(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/view`, {}, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user's annonces
   */
  getUserAnnonces(): Observable<ApiResponse<Annonce[]>> {
    return this.http.get<ApiResponse<Annonce[]>>(`${this.apiUrl}/user/me`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Change annonce status
   */
  updateStatus(id: number, statut: string): Observable<ApiResponse<Annonce>> {
    return this.http.patch<ApiResponse<Annonce>>(`${this.apiUrl}/${id}/status`, 
      { statut }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || 
                     `Erreur ${error.status}: ${error.statusText}`;
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}