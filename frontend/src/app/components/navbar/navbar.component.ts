import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="logo">KBTU Tickets</a>
        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
          <li><a routerLink="/events" routerLinkActive="active">Events</a></li>
          @if (authService.currentUser()) {
            @if (authService.currentUser()?.role === 'admin') {
              <li><a routerLink="/manage-events" routerLinkActive="active" style="color: #ff9800;">Manage Events</a></li>
            }
            <li><a routerLink="/orders" routerLinkActive="active">My Orders</a></li>
            <li><a routerLink="/notifications" routerLinkActive="active">Notifications</a></li>
            <li><a routerLink="/settings" routerLinkActive="active">Settings</a></li>
            <li><span class="user-greeting">Hi, {{authService.currentUser()?.username}}</span></li>
            <li><button class="btn btn-outline" (click)="logout()">Logout</button></li>
          } @else {
            <li><a routerLink="/login" class="btn btn-outline">Login</a></li>
            <li><a routerLink="/register" class="btn btn-primary">Register</a></li>
          }
          <li>
            <button class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle Theme">
              {{ themeService.isDarkTheme() ? '☀️' : '🌙' }}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .navbar { background-color: var(--navbar-bg); padding: 1rem 0; color: var(--navbar-text); transition: background-color 0.3s ease; }
    .nav-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: bold; color: var(--navbar-text); text-decoration: none; }
    .nav-links { display: flex; list-style: none; gap: 1.5rem; align-items: center; margin: 0; padding: 0; }
    .nav-links a { color: var(--navbar-text); text-decoration: none; font-weight: 500; }
    .nav-links a.active { border-bottom: 2px solid var(--navbar-text); }
    .btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; font-weight: bold; }
    .btn-primary { background-color: var(--accent-color); color: #fff; border: none; }
    .btn-outline { background-color: transparent; border: 1px solid var(--navbar-text); color: var(--navbar-text); }
    .btn:hover { opacity: 0.9; }
    .user-greeting { font-style: italic; }
    .theme-toggle { background: transparent; border: none; cursor: pointer; font-size: 1.2rem; padding: 0.2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .theme-toggle:hover { background-color: rgba(255, 255, 255, 0.1); }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
