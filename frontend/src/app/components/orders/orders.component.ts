import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order/order.service';
import { Order } from '../../models/interfaces';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="mb-4">My Orders</h2>

      @if (actionMessage) {
        <div class="success-alert">{{ actionMessage }}</div>
      }

      @if (isLoading) {
        <div class="text-center p-4">Loading orders...</div>
      } @else if (errorMessage) {
        <div class="error-alert">{{ errorMessage }}</div>
      } @else if (orders.length === 0) {
        <div class="no-orders text-center">
          <h3>You have no orders yet</h3>
          <p>Browse our events and book your first ticket!</p>
          <a routerLink="/events" class="btn btn-primary mt-3">Browse Events</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders; track order.id) {
            <div class="order-card" [class.cancelled]="order.status === 'cancelled'">
              <div class="order-header">
                <div>
                  <span class="order-id">Order #{{ order.id }}</span>
                  <span class="order-date">{{ order.created_at | date:'medium' }}</span>
                </div>
                <div class="status-badge" [ngClass]="'status-' + order.status">
                  {{ order.status | uppercase }}
                </div>
              </div>
              <div class="order-body">
                <div class="event-info">
                  <h4>{{ order.event.title }}</h4>
                  <p class="text-muted">{{ order.event.location }} | {{ order.event.date | date:'short' }}</p>
                </div>
                <div class="order-details text-right">
                  <p><strong>Quantity:</strong> {{ order.quantity }} ticket(s)</p>
                  <p class="total-price"><strong>Total:</strong> {{ order.total_price | currency:'KZT':'symbol-narrow' }}</p>
                </div>
              </div>
              @if (order.status !== 'cancelled') {
                <div class="order-footer">
                  <button class="btn btn-danger btn-sm" (click)="cancelOrder(order.id)">Cancel Order</button>
                </div>
              }
            </div>
          }
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
    .text-right { text-align: right; }
    .text-muted { color: var(--muted-text); font-size: 0.9rem; }

    .no-orders { padding: 4rem 2rem; background: var(--card-bg); border-radius: 8px; border: 1px dashed var(--border-color); }
    .no-orders h3 { color: var(--primary-color); margin-top: 0; }

    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .order-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow: hidden; transition: box-shadow 0.2s; color: var(--text-color); }
    .order-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .order-card.cancelled { opacity: 0.7; }

    .order-header { padding: 1rem 1.5rem; background-color: var(--table-header); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .order-id { font-weight: bold; margin-right: 1rem; }
    .order-date { color: var(--muted-text); font-size: 0.9rem; }

    .status-badge { padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-confirmed { background-color: #d4edda; color: #155724; }
    .status-cancelled { background-color: #f8d7da; color: #721c24; text-decoration: line-through; }

    .order-body { padding: 1.5rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .event-info h4 { margin: 0 0 0.5rem; color: var(--primary-color); }
    .total-price { font-size: 1.1rem; color: #2e7d32; margin-top: 0.5rem; }

    .order-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); background-color: var(--table-hover); text-align: right; }

    .btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; font-weight: bold; border: none; display: inline-block; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.85rem; }
    .btn:hover { opacity: 0.9; }

    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #d32f2f; }
    .success-alert { padding: 1rem; background-color: rgba(40, 167, 69, 0.12); color: #1d6b33; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #28a745; }
  `]
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);

  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  actionMessage = '';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load your orders.';
        this.isLoading = false;
      }
    });
  }

  cancelOrder(id: number) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.errorMessage = '';
      this.actionMessage = '';
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          const order = this.orders.find(o => o.id === id);
          if (order) {
            order.status = 'cancelled';
          }
          this.actionMessage = `Order #${id} was cancelled successfully.`;
        },
        error: () => {
          this.errorMessage = 'Failed to cancel order.';
        }
      });
    }
  }
}
