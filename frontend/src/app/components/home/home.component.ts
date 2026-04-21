import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event/event.service';
import { Event } from '../../models/interfaces';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero">
      <div class="container hero-content">
        <h1>Welcome to KBTU Event Ticket Store</h1>
        <p>Find and book tickets for lectures, concerts, hackathons, and sports events.</p>
        <a routerLink="/events" class="btn btn-primary btn-lg">Browse Events</a>
      </div>
    </div>
    
    <div class="container mt-4">
      <h2 class="mb-3">Featured Events</h2>
      
      @if (errorMessage) {
        <div class="error-alert">{{ errorMessage }}</div>
      }
      
      <div class="events-grid">
        @for (event of featuredEvents; track event.id) {
          <div class="event-card">
            <div class="card-img" [style.background-image]="'url(' + (event.image ? event.image : '/assets/placeholder.jpg') + ')'"></div>
            <div class="card-body">
              <div class="category-badge">{{ event.category.name }}</div>
              <h3 class="card-title">{{ event.title }}</h3>
              <p class="card-date">{{ event.date | date:'medium' }}</p>
              <p class="card-price">{{ event.price | currency:'KZT':'symbol-narrow' }}</p>
              <a [routerLink]="['/events', event.id]" class="btn btn-outline btn-block">View Details</a>
            </div>
          </div>
        }
        @if (featuredEvents.length === 0 && !errorMessage) {
          <p>No events found.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .hero { background: linear-gradient(rgba(0, 53, 128, 0.8), rgba(0, 53, 128, 0.8)), url('https://kbtu.edu.kz/images/kbtu_main.jpg') center/cover; color: white; padding: 4rem 0; text-align: center; margin-bottom: 2rem; }
    .hero-content h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .hero-content p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .btn-lg { padding: 0.75rem 1.5rem; font-size: 1.1rem; }
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .event-card { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; background: var(--card-bg); }
    .event-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    .card-img { height: 200px; background-size: cover; background-position: center; background-color: var(--border-color); }
    .card-body { padding: 1.5rem; }
    .category-badge { display: inline-block; padding: 0.25rem 0.5rem; background-color: var(--badge-bg); color: var(--text-color); border-radius: 4px; font-size: 0.8rem; margin-bottom: 0.5rem; font-weight: bold; }
    .card-title { font-size: 1.25rem; margin: 0 0 0.5rem; color: var(--primary-color); }
    .card-date { color: var(--muted-text); font-size: 0.9rem; margin-bottom: 0.5rem; }
    .card-price { font-size: 1.1rem; font-weight: bold; color: #2e7d32; margin-bottom: 1rem; }
    .btn-block { display: block; text-align: center; width: 100%; box-sizing: border-box; }
    .btn-outline { border: 1px solid var(--primary-color); color: var(--primary-color); background: transparent; text-decoration: none; padding: 0.5rem 1rem; border-radius: 4px; font-weight: bold; }
    .btn-outline:hover { background: var(--primary-color); color: white; }
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class HomeComponent implements OnInit {
  eventService = inject(EventService);
  featuredEvents: Event[] = [];
  errorMessage = '';

  ngOnInit() {
    this.eventService.getEvents().pipe(
      catchError(error => {
        this.errorMessage = 'Failed to load events. Please try again later.';
        return of([]);
      })
    ).subscribe(events => {
      // Just taking first 6 events for the homepage
      this.featuredEvents = events.slice(0, 6);
    });
  }
}
