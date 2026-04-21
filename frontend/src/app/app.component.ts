import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer class="mt-5 py-4 text-center text-muted border-top">
      <div class="container">
        <p>&copy; 2026 KBTU Event Ticket Store. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    main { min-height: calc(100vh - 160px); }
    .mt-5 { margin-top: 3rem; }
    .py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .text-center { text-align: center; }
    .text-muted { color: var(--muted-text); }
    .border-top { border-top: 1px solid var(--border-color); }
  `]
})
export class AppComponent {
  title = 'KBTU Event Ticket Store';
  themeService = inject(ThemeService);
}
