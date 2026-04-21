import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/`);
  }

  createOrder(eventId: number, quantity: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/`, { event_id: eventId, quantity });
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
