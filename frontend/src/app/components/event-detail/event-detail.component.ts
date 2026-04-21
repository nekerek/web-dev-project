import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event/event.service';
import { OrderService } from '../../services/order/order.service';
import { AuthService } from '../../services/auth/auth.service';
import { Event } from '../../models/interfaces';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isLoading()) {
      <div class="container text-center mt-5">
        <h2>Loading event details...</h2>
      </div>
    } @else if (errorMessage()) {
      <div class="container mt-5">
        <div class="error-alert">{{ errorMessage() }}</div>
      </div>
    } @else if (event()) {
      <div class="event-hero" [style.backgroundImage]="'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(' + (event()?.image || '/assets/placeholder.jpg') + ')'">
        <div class="container text-center text-white hero-inner">
          <div class="category-badge mb-2">{{ event()?.category?.name }}</div>
          <h1>{{ event()?.title }}</h1>
          <p class="lead">{{ event()?.date | date:'fullDate' }} at {{ event()?.date | date:'shortTime' }}</p>
        </div>
      </div>
      
      <div class="container mt-4">
        <div class="row">
          <div class="col-md-8">
            <div class="card p-4">
              <h3 class="mb-3">About this event</h3>
              <p class="event-desc">{{ event()?.description }}</p>
              
              <h4 class="mt-4 mb-2">Location</h4>
              <p>📍 {{ event()?.location }}</p>
              
              <h4 class="mt-4 mb-2">Organizer</h4>
              <p>👤 {{ event()?.organizer }}</p>
              @if (event()?.organization) {
                <p>🏢 {{ event()?.organization }}</p>
              }
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card ticket-card">
              <h3 class="price-tag">{{ event()?.price | currency:'KZT':'symbol-narrow' }}</h3>
              <div class="seats-status mb-3">
                <div class="progress-bar-bg">
                  <div class="progress-bar" [style.width]="(event()!.available_seats / event()!.total_seats) * 100 + '%'" [class.low]="event()!.available_seats < event()!.total_seats * 0.2"></div>
                </div>
                <p class="text-muted mt-1">{{ event()?.available_seats }} seats available out of {{ event()?.total_seats }}</p>
              </div>
              
              @if (authService.isLoggedIn()) {
                <div class="purchase-form">
                  <div class="form-group mb-3">
                    <label for="quantity">Quantity</label>
                    <input type="number" id="quantity" [(ngModel)]="quantity" min="1" [max]="event()!.available_seats" class="form-control" />
                  </div>
                  
                  <div class="total-price mb-3 d-flex justify-between">
                    <span>Total:</span>
                    <strong>{{ (+event()!.price * quantity) | currency:'KZT':'symbol-narrow' }}</strong>
                  </div>
                  
                  @if (purchaseError) {
                    <div class="error-alert small">{{ purchaseError }}</div>
                  }
                  @if (purchaseSuccess) {
                    <div class="success-alert small">Order placed successfully!</div>
                  }
                  
                  <button class="btn btn-primary btn-block btn-lg" (click)="buyTicket()" [disabled]="isPurchasing || event()!.available_seats < quantity || quantity < 1">
                    {{ isPurchasing ? 'Processing...' : 'Buy Tickets' }}
                  </button>
                </div>
              } @else {
                <div class="alert alert-info">
                  Please log in to purchase tickets.
                </div>
                <button class="btn btn-primary btn-block" (click)="goToLogin()">Log In</button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .event-hero { background-size: cover; background-position: center; padding: 4rem 0; min-height: 300px; display: flex; align-items: center; }
    .hero-inner { width: 100%; }
    .text-center { text-align: center; }
    .text-white { color: white; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-5 { margin-top: 3rem; }
    .row { display: flex; flex-wrap: wrap; gap: 2rem; margin: 0 -15px; }
    .col-md-8 { flex: 0 0 calc(66.666% - 2rem); max-width: calc(66.666% - 2rem); }
    .col-md-4 { flex: 0 0 calc(33.333% - 2rem); max-width: calc(33.333% - 2rem); }
    @media (max-width: 768px) { .col-md-8, .col-md-4 { flex: 0 0 100%; max-width: 100%; } }
    
    .card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); color: var(--text-color); }
    .p-4 { padding: 1.5rem; }
    .ticket-card { padding: 2rem; border-top: 5px solid var(--primary-color); position: sticky; top: 20px; }
    .category-badge { display: inline-block; padding: 0.3rem 0.8rem; background-color: var(--accent-color); color: white; border-radius: 20px; font-weight: bold; }
    .price-tag { font-size: 2.5rem; color: #2e7d32; margin: 0 0 1rem; text-align: center; }
    .event-desc { white-space: pre-line; line-height: 1.6; color: var(--text-color); }
    
    .progress-bar-bg { background-color: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; }
    .progress-bar { background-color: #2e7d32; height: 100%; transition: width 0.3s ease; }
    .progress-bar.low { background-color: #d32f2f; }
    .text-muted { color: var(--muted-text); font-size: 0.9rem; }
    .mt-1 { margin-top: 0.25rem; }
    
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; box-sizing: border-box; background: var(--input-bg); color: var(--text-color); }
    .btn { padding: 0.75rem 1.5rem; font-weight: bold; border-radius: 4px; border: none; cursor: pointer; text-align: center; }
    .btn-block { display: block; width: 100%; }
    .btn-lg { padding: 1rem; font-size: 1.1rem; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-primary:hover:not(:disabled) { background-color: var(--primary-hover); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .d-flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .total-price { font-size: 1.2rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .total-price strong { color: var(--primary-color); }
    
    .alert-info { background-color: var(--alert-bg); color: var(--alert-text); padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #d32f2f; }
    .success-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #28a745; }
    .small { padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0.5rem; }
  `]
})
export class EventDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  eventService = inject(EventService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  
  event = signal<Event | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  
  quantity = 1;
  isPurchasing = false;
  purchaseError = '';
  purchaseSuccess = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
    } else {
      this.errorMessage.set('Invalid event ID');
      this.isLoading.set(false);
    }
  }

  loadEvent(id: number) {
    this.eventService.getEventById(id).subscribe({
      next: (eventData) => {
        this.event.set(eventData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Event not found or failed to load.');
        this.isLoading.set(false);
      }
    });
  }

  buyTicket() {
    const currentEvent = this.event();
    if (!currentEvent) return;
    
    this.isPurchasing = true;
    this.purchaseError = '';
    this.purchaseSuccess = false;
    
    this.orderService.createOrder(currentEvent.id, this.quantity).subscribe({
      next: (order) => {
        this.isPurchasing = false;
        this.purchaseSuccess = true;
        // Update local available seats count
        this.event.update(e => {
          if (e) e.available_seats -= this.quantity;
          return e;
        });
        // Reset quantity
        this.quantity = 1;
        
        // Optional: Redirect to orders page after short delay
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: (err) => {
        this.isPurchasing = false;
        this.purchaseError = err.error?.non_field_errors?.[0] || 'Failed to complete purchase. Please try again.';
      }
    });
  }
  
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
