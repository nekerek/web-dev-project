import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
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
