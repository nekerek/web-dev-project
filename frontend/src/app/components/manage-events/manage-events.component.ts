import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { Event } from '../../models/interfaces';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4 mb-5">
      <div class="d-flex justify-between align-items-center mb-4">
        <h2>Manage My Events</h2>
        <a routerLink="/manage-events/new" class="btn btn-primary">Create New Event</a>
      </div>

      @if (actionMessage) {
        <div class="success-alert">{{ actionMessage }}</div>
      }

      @if (isLoading) {
        <div class="text-center p-4">Loading your events...</div>
      } @else if (errorMessage) {
        <div class="error-alert">{{ errorMessage }}</div>
      } @else if (myEvents.length === 0) {
        <div class="no-events text-center">
          <h3>You haven't created any events yet</h3>
          <p>Get started by creating your first event!</p>
          <a routerLink="/manage-events/new" class="btn btn-primary mt-3">Create Event</a>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Price</th>
                <th>Seats (Avail/Total)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (event of myEvents; track event.id) {
                <tr>
                  <td>
                    <strong>{{ event.title }}</strong><br>
                    <small class="text-muted">{{ event.category.name }}</small>
                  </td>
                  <td>{{ event.date | date:'short' }}</td>
                  <td>{{ event.price | currency:'KZT':'symbol-narrow' }}</td>
                  <td>{{ event.available_seats }} / {{ event.total_seats }}</td>
                  <td>
                    <span class="badge" [class.bg-success]="event.is_active" [class.bg-secondary]="!event.is_active">
                      {{ event.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <a [routerLink]="['/events', event.id]" class="btn btn-sm btn-outline-info">View</a>
                      <a [routerLink]="['/manage-events/edit', event.id]" class="btn btn-sm btn-outline-primary">Edit</a>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteEvent(event.id)">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    .mb-5 { margin-bottom: 3rem; }
    .p-4 { padding: 1.5rem; }
    .text-center { text-align: center; }
    .d-flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .align-items-center { align-items: center; }
    .text-muted { color: var(--muted-text); }

    .no-events { padding: 4rem 2rem; background: var(--card-bg); border-radius: 8px; border: 1px dashed var(--border-color); }
    .no-events h3 { color: var(--primary-color); margin-top: 0; }

    .table-responsive { overflow-x: auto; background: var(--card-bg); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--border-color); color: var(--text-color); }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
    .table th { background-color: var(--table-header); font-weight: bold; color: var(--text-color); }
    .table tbody tr:hover { background-color: var(--table-hover); }

    .badge { padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; color: white; }
    .bg-success { background-color: #28a745; }
    .bg-secondary { background-color: #6c757d; }

    .btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; font-weight: bold; border: none; display: inline-block; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
    .btn-group { display: flex; gap: 0.5rem; }

    .btn-outline-primary { color: var(--primary-color); border: 1px solid var(--primary-color); background: transparent; }
    .btn-outline-primary:hover { color: white; background: var(--primary-color); }
    .btn-outline-info { color: #17a2b8; border: 1px solid #17a2b8; background: transparent; }
    .btn-outline-info:hover { color: white; background: #17a2b8; }
    .btn-outline-danger { color: #dc3545; border: 1px solid #dc3545; background: transparent; }
    .btn-outline-danger:hover { color: white; background: #dc3545; }

    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #d32f2f; }
    .success-alert { padding: 1rem; background-color: rgba(40, 167, 69, 0.12); color: #1d6b33; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #28a745; }
  `]
})
export class ManageEventsComponent implements OnInit {
  eventService = inject(EventService);
  authService = inject(AuthService);

  myEvents: Event[] = [];
  isLoading = true;
  errorMessage = '';
  actionMessage = '';

  ngOnInit() {
    this.loadMyEvents();
  }

  loadMyEvents() {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        const currentUserId = this.authService.currentUser()?.id;
        this.myEvents = events.filter(e => e.organizer?.id === currentUserId);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load events.';
        this.isLoading = false;
      }
    });
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.errorMessage = '';
      this.actionMessage = '';
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.myEvents = this.myEvents.filter(e => e.id !== id);
          this.actionMessage = 'Event deleted successfully.';
        },
        error: () => {
          this.errorMessage = 'Failed to delete event.';
        }
      });
    }
  }
}
