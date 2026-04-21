import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, Category } from '../../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/`);
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}/`);
  }

  searchEvents(query: string, category: string): Observable<Event[]> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    if (category) params = params.set('category', category);
    
    return this.http.get<Event[]>(`${this.apiUrl}/events/search/`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }

  createEvent(data: any): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events/`, data);
  }

  updateEvent(id: number, data: any): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}/`, data);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}/`);
  }
}
