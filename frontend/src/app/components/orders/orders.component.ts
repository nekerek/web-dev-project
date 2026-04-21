import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order/order.service';
import { Order } from '../../models/interfaces';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
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
