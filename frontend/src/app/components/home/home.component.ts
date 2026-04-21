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
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  eventService = inject(EventService);
  featuredEvents: Event[] = [];
  errorMessage = '';

  ngOnInit() {
    this.eventService.getEvents().pipe(
      catchError(() => {
        this.errorMessage = 'Failed to load events. Please try again later.';
        return of([]);
      })
    ).subscribe(events => {
      this.featuredEvents = events.slice(0, 8);
    });
  }
}
