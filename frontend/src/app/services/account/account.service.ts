import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationItem, ProfileSettings } from '../../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileSettings> {
    return this.http.get<ProfileSettings>(`${this.apiUrl}/auth/profile/`);
  }

  updateProfile(payload: Partial<ProfileSettings>): Observable<ProfileSettings> {
    return this.http.put<ProfileSettings>(`${this.apiUrl}/auth/profile/`, payload);
  }

  getNotifications(markAllRead = false): Observable<NotificationItem[]> {
    let params = new HttpParams();
    if (markAllRead) {
      params = params.set('mark_read', 'all');
    }
    return this.http.get<NotificationItem[]>(`${this.apiUrl}/notifications/`, { params });
  }
}
