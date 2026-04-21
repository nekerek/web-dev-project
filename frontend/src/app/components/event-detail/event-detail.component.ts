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
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
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
