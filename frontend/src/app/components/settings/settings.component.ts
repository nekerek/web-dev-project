import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '../../services/account/account.service';
import { EventService } from '../../services/event/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { Category, ProfileSettings, User } from '../../models/interfaces';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private accountService = inject(AccountService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  categories: Category[] = [];
  profile: ProfileSettings = {
    id: 0,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user',
    email_notifications: true,
    event_reminders: true,
    marketing_updates: false,
    preferred_category_id: null
  };

  ngOnInit(): void {
    this.eventService.getCategories().pipe(catchError(() => of([]))).subscribe(categories => {
      this.categories = categories;
    });

    this.accountService.getProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load your settings.';
        this.isLoading = false;
      }
    });
  }

  saveSettings(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.accountService.updateProfile(this.profile).subscribe({
      next: profile => {
        this.profile = profile;
        const currentUser = this.authService.currentUser();
        const updatedUser: User = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: profile.role,
          avatar: currentUser?.avatar
        };
        this.authService.updateCurrentUser(updatedUser);
        this.successMessage = 'Settings saved successfully.';
        this.isSaving = false;
      },
      error: () => {
        this.errorMessage = 'Failed to save settings. Please try again.';
        this.isSaving = false;
      }
    });
  }
}
