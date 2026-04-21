import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event/event.service';
import { Event, Category } from '../../models/interfaces';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  eventService = inject(EventService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  events: Event[] = [];
  categories: Category[] = [];

  searchQuery = '';
  selectedCategory = '';
  selectedDate = '';
  errorMessage = '';
  calendarDays: Array<{
    iso: string;
    day: string;
    weekday: string;
    monthLabel: string;
    weekend: boolean;
  }> = [];

  ngOnInit() {
    this.buildCalendarDays();
    this.loadCategories();
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery = params.get('q') ?? '';
      this.selectedCategory = params.get('category') ?? '';
      this.selectedDate = params.get('date') ?? '';
      this.searchEvents(false);
    });
  }

  loadCategories() {
    this.eventService.getCategories().pipe(
      catchError(() => of([]))
    ).subscribe(cats => {
      this.categories = cats;
    });
  }

  searchEvents(syncUrl = true) {
    this.errorMessage = '';
    if (syncUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          q: this.searchQuery || null,
          category: this.selectedCategory || null,
          date: this.selectedDate || null
        },
        queryParamsHandling: 'merge'
      });
    }
    this.eventService.searchEvents(this.searchQuery, this.selectedCategory).pipe(
      catchError(() => {
        this.errorMessage = 'Failed to load events.';
        return of([]);
      })
    ).subscribe(events => {
      this.events = this.selectedDate
        ? events.filter(event => this.toDateKey(event.date) === this.selectedDate)
        : events;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedDate = '';
    this.searchEvents();
  }

  selectDate(date: string) {
    this.selectedDate = this.selectedDate === date ? '' : date;
    this.searchEvents();
  }

  private buildCalendarDays() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    this.calendarDays = Array.from({ length: 18 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const weekdayIndex = date.getDay();
      return {
        iso: this.toDateKey(date.toISOString()),
        day: String(date.getDate()),
        weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekdayIndex],
        monthLabel: date.toLocaleString('en-US', { month: 'short' }),
        weekend: weekdayIndex === 0 || weekdayIndex === 6
      };
    });
  }

  private toDateKey(value: string) {
    return value.slice(0, 10);
  }
}
