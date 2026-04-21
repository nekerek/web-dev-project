import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container login-container">
      <div class="login-card">
        <h2>Login</h2>
        @if (errorMessage) {
          <div class="error-alert">{{ errorMessage }}</div>
        }
        <form (ngSubmit)="login()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" [(ngModel)]="credentials.username" required class="form-control" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="credentials.password" required class="form-control" />
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="!loginForm.form.valid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 70vh; }
    .login-card { background: var(--card-bg); padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; border: 1px solid var(--border-color); color: var(--text-color); }
    .login-card h2 { text-align: center; color: var(--primary-color); margin-top: 0; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; box-sizing: border-box; background: var(--input-bg); color: var(--text-color); }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(0,53,128,0.2); }
    .btn-block { display: block; width: 100%; font-size: 1.1rem; padding: 0.75rem; }
    .btn-primary { background-color: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #d32f2f; }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  login() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || err.error?.non_field_errors?.[0] || 'Invalid username or password.';
      }
    });
  }
}
