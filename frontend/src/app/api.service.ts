import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { Category, Listing, ListingPayload, LoginResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';
  readonly username = signal(localStorage.getItem('username') ?? '');
  readonly errorMessage = signal('');

  constructor(private http: HttpClient) {}

  getToken(): string {
    return localStorage.getItem('token') ?? '';
  }

  clearError(): void {
    this.errorMessage.set('');
  }

  handleError(error: unknown): Observable<never> {
    this.errorMessage.set('Request failed. Check that the Django server is running and try again.');
    return throwError(() => error);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login/`, { username, password }).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        this.username.set(response.username);
        this.clearError();
      }),
      catchError((error) => this.handleError(error))
    );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/auth/logout/`, {}).pipe(
      catchError((error) => this.handleError(error))
    ).subscribe({
      complete: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.username.set('');
      }
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/listings/`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getFeaturedListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/listings/featured/`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  createListing(payload: ListingPayload): Observable<Listing> {
    return this.http.post<Listing>(`${this.baseUrl}/listings/`, payload).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  deleteListing(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/listings/${id}/`).pipe(
      catchError((error) => this.handleError(error))
    );
  }
}
