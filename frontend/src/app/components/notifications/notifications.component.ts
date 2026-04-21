import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../services/account/account.service';
import { NotificationItem } from '../../models/interfaces';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="page-header">
        <div>
          <h2>Notifications</h2>
          <p class="text-muted">Recent updates about your orders and managed events.</p>
        </div>
        <button class="btn btn-outline" (click)="markAllAsRead()" [disabled]="isLoading || notifications.length === 0">
          Mark all as read
        </button>
      </div>

      <div class="card p-4 mt-3 filter-card">
        <label for="kindFilter">Filter</label>
        <select id="kindFilter" name="kindFilter" [(ngModel)]="kindFilter" class="form-control">
          <option value="all">All notifications</option>
          <option value="order">Orders</option>
          <option value="event">Managed events</option>
        </select>
      </div>

      @if (errorMessage) {
        <div class="error-alert mt-3">{{ errorMessage }}</div>
      }

      @if (isLoading) {
        <div class="card p-4 text-center mt-3">Loading notifications...</div>
      } @else if (filteredNotifications.length === 0) {
        <div class="card p-4 text-center mt-3">
          <p class="text-muted">You have no notifications in this filter.</p>
        </div>
      } @else {
        <div class="notifications-list mt-3">
          @for (item of filteredNotifications; track item.id) {
            <article class="card p-4 notification-card" [class.notification-read]="item.is_read">
              <div class="notification-top">
                <div>
                  <span class="pill" [class.pill-event]="item.kind === 'event'">
                    {{ item.kind === 'event' ? 'Event' : 'Order' }}
                  </span>
                  <h3>{{ item.title }}</h3>
                </div>
                <small class="text-muted">{{ item.created_at | date:'medium' }}</small>
              </div>
              <p>{{ item.message }}</p>
              @if (item.action_route) {
                <a [routerLink]="item.action_route" class="btn btn-link">
                  {{ item.action_label || 'Open' }}
                </a>
              }
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .mt-4 { margin-top: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    .p-4 { padding: 1.5rem; }
    .card { background: var(--card-bg); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
    .text-center { text-align: center; }
    .text-muted { color: var(--muted-text); }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .filter-card { display: flex; gap: 1rem; align-items: center; }
    .filter-card label { font-weight: 600; }
    .form-control { min-width: 220px; padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; background: var(--input-bg); color: var(--text-color); }
    .notifications-list { display: grid; gap: 1rem; }
    .notification-card { color: var(--text-color); }
    .notification-read { opacity: 0.74; }
    .notification-top { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 0.75rem; }
    .notification-top h3 { margin: 0.5rem 0 0; color: var(--primary-color); }
    .pill { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px; background: rgba(0, 53, 128, 0.12); color: var(--primary-color); font-weight: 700; font-size: 0.8rem; }
    .pill-event { background: rgba(255, 152, 0, 0.14); color: #b26a00; }
    .btn { padding: 0.65rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; font-weight: bold; border: none; }
    .btn-outline { background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); }
    .btn-link { display: inline-block; margin-top: 0.5rem; color: var(--primary-color); padding: 0; background: transparent; }
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; border-left: 4px solid #d32f2f; }
    @media (max-width: 720px) {
      .page-header, .filter-card, .notification-top { flex-direction: column; align-items: stretch; }
      .form-control { min-width: 0; width: 100%; }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private accountService = inject(AccountService);

  notifications: NotificationItem[] = [];
  kindFilter: 'all' | 'order' | 'event' = 'all';
  isLoading = true;
  errorMessage = '';

  get filteredNotifications(): NotificationItem[] {
    if (this.kindFilter === 'all') {
      return this.notifications;
    }
    return this.notifications.filter(item => item.kind === this.kindFilter);
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(markAllRead = false): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.accountService.getNotifications(markAllRead).subscribe({
      next: notifications => {
        this.notifications = notifications;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load notifications.';
        this.isLoading = false;
      }
    });
  }

  markAllAsRead(): void {
    this.loadNotifications(true);
  }
}
