import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event/event.service';
import { Event, Category } from '../../models/interfaces';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-3">Event Catalog</h2>
      
      <div class="search-bar mb-4">
        <form (ngSubmit)="searchEvents()" class="search-form">
          <div class="form-group flex-grow">
            <input type="text" [(ngModel)]="searchQuery" name="query" placeholder="Search events by title or description..." class="form-control" />
          </div>
          <div class="form-group">
            <select [(ngModel)]="selectedCategory" name="category" class="form-control">
              <option value="">All Categories</option>
              @for (cat of categories; track cat.slug) {
                <option [value]="cat.slug">{{ cat.name }}</option>
              }
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Search</button>
        </form>
      </div>

      @if (errorMessage) {
        <div class="error-alert">{{ errorMessage }}</div>
      }

      <div class="events-grid">
        @for (event of events; track event.id) {
          <div class="event-card">
            <div class="card-img" [style.background-image]="'url(' + (event.image ? event.image : '/assets/placeholder.jpg') + ')'"></div>
            <div class="card-body">
              <div class="category-badge">{{ event.category.name }}</div>
              <h3 class="card-title">{{ event.title }}</h3>
              <p class="card-date">{{ event.date | date:'medium' }}</p>
              <p class="card-price">{{ event.price | currency:'KZT':'symbol-narrow' }}</p>
              <div class="d-flex justify-between align-items-center mt-2">
                <span class="seats-info">{{ event.available_seats }} / {{ event.total_seats }} seats</span>
                <a [routerLink]="['/events', event.id]" class="btn btn-outline btn-sm">Details</a>
              </div>
            </div>
          </div>
        }
        @if (events.length === 0 && !errorMessage) {
          <div class="no-results">
            <h3>No events found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-form { display: flex; gap: 1rem; align-items: stretch; background: var(--card-bg); padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
    .flex-grow { flex-grow: 1; margin-bottom: 0 !important; }
    .form-group { margin-bottom: 0; }
    .form-control { padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; box-sizing: border-box; width: 100%; height: 100%; background: var(--input-bg); color: var(--text-color); }
    .btn { padding: 0.75rem 1.5rem; font-weight: bold; border-radius: 4px; border: none; cursor: pointer; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.9rem; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline { border: 1px solid var(--primary-color); color: var(--primary-color); background: transparent; text-decoration: none; }
    .btn-outline:hover { background: var(--primary-color); color: white; }
    
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .event-card { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; background: var(--card-bg); display: flex; flex-direction: column; }
    .event-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    .card-img { height: 200px; background-size: cover; background-position: center; background-color: var(--border-color); }
    .card-body { padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; }
    .category-badge { display: inline-block; padding: 0.25rem 0.5rem; background-color: var(--badge-bg); color: var(--text-color); border-radius: 4px; font-size: 0.8rem; margin-bottom: 0.5rem; font-weight: bold; align-self: flex-start; }
    .card-title { font-size: 1.25rem; margin: 0 0 0.5rem; color: var(--primary-color); }
    .card-date { color: var(--muted-text); font-size: 0.9rem; margin-bottom: 0.5rem; }
    .card-price { font-size: 1.2rem; font-weight: bold; color: #2e7d32; margin-bottom: 0.5rem; }
    .seats-info { font-size: 0.85rem; color: var(--muted-text); }
    .d-flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .align-items-center { align-items: center; }
    .mt-2 { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    
    .no-results { grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--muted-text); }
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class EventsComponent implements OnInit {
  eventService = inject(EventService);
  
  events: Event[] = [];
  categories: Category[] = [];
  
  searchQuery = '';
  selectedCategory = '';
  errorMessage = '';

  ngOnInit() {
    this.loadCategories();
    this.searchEvents();
  }

  loadCategories() {
    this.eventService.getCategories().pipe(
      catchError(() => of([]))
    ).subscribe(cats => {
      this.categories = cats;
    });
  }

  searchEvents() {
    this.errorMessage = '';
    this.eventService.searchEvents(this.searchQuery, this.selectedCategory).pipe(
      catchError(err => {
        this.errorMessage = 'Failed to load events.';
        return of([]);
      })
    ).subscribe(events => {
      this.events = events;
    });
  }
}
