import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container login-container">
      <div class="login-card">
        <h2>Create an Account</h2>
        @if (errorMessage) {
          <div class="error-alert">{{ errorMessage }}</div>
        }
        <form (ngSubmit)="register()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" [(ngModel)]="userData.username" required class="form-control" />
          </div>
          <div class="form-group">
            <label for="email">Email (optional)</label>
            <input type="email" id="email" name="email" [(ngModel)]="userData.email" class="form-control" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="userData.password" required class="form-control" minlength="4" />
          </div>
          <div class="form-group">
            <label for="role">Account Type</label>
            <select id="role" name="role" [(ngModel)]="userData.role" class="form-control">
              <option value="user">Regular User (Buy Tickets)</option>
              <option value="admin">Event Organizer (Create Events)</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block mt-4" [disabled]="!registerForm.form.valid || isLoading">
            {{ isLoading ? 'Creating account...' : 'Register' }}
          </button>
        </form>
        <p class="text-center mt-3" style="font-size: 0.9rem;">
          Already have an account? <a routerLink="/login">Log in here</a>.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 2rem 0; }
    .login-card { background: var(--card-bg); padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 450px; border: 1px solid var(--border-color); color: var(--text-color); }
    .login-card h2 { text-align: center; color: var(--primary-color); margin-top: 0; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; box-sizing: border-box; background: var(--input-bg); color: var(--text-color); }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(0,53,128,0.2); }
    .btn-block { display: block; width: 100%; font-size: 1.1rem; padding: 0.75rem; }
    .btn-primary { background-color: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #d32f2f; }
    .text-center { text-align: center; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
  `]
})
export class RegisterComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  };
  
  isLoading = false;
  errorMessage = '';

  register() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.register(this.userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        // Basic error extraction
        if (err.error) {
          const keys = Object.keys(err.error);
          if (keys.length > 0) {
            const firstError = err.error[keys[0]];
            this.errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            return;
          }
        }
        this.errorMessage = 'Registration failed. Please try a different username.';
      }
    });
  }
}
