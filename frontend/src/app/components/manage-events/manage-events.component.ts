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
  templateUrl: './manage-events.component.html',
  styleUrl: './manage-events.component.css'
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
