import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  searchQuery = '';
  navCategories = [
    { label: 'Cinema', route: '/events', query: { category: 'cinema' } },
    { label: 'Theater', route: '/events', query: { category: 'theater' } },
    { label: 'Concerts', route: '/events', query: { category: 'concerts' } },
    { label: 'Entertainment', route: '/events', query: { category: 'entertainment' } },
    { label: 'Stand Up', route: '/events', query: { category: 'stand-up' } },
    { label: 'Museums', route: '/events', query: { category: 'museums' } },
    { label: 'Sports', route: '/events', query: { category: 'sports' } },
    { label: 'Workshops', route: '/events', query: { category: 'workshops' } },
    { label: 'Tours', route: '/events', query: { category: 'tours' } }
  ];

  submitSearch() {
    this.router.navigate(['/events'], {
      queryParams: { q: this.searchQuery || null },
      queryParamsHandling: 'merge'
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
