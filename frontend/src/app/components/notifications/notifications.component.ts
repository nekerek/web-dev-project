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
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
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
