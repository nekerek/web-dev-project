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
  template: `
    <div class="container mt-4">
      <div class="page-header">
        <div>
          <h2>Settings</h2>
          <p class="text-muted">Manage your profile and notification preferences.</p>
        </div>
      </div>

      @if (isLoading) {
        <div class="card p-4 mt-3">Loading your settings...</div>
      } @else {
        <form class="settings-grid mt-3" (ngSubmit)="saveSettings()" #settingsForm="ngForm">
          <section class="card p-4">
            <h3>Profile</h3>

            @if (errorMessage) {
              <div class="error-alert">{{ errorMessage }}</div>
            }
            @if (successMessage) {
              <div class="success-alert">{{ successMessage }}</div>
            }

            <div class="form-row">
              <div class="form-group">
                <label for="first_name">First name</label>
                <input id="first_name" name="first_name" [(ngModel)]="profile.first_name" class="form-control" />
              </div>
              <div class="form-group">
                <label for="last_name">Last name</label>
                <input id="last_name" name="last_name" [(ngModel)]="profile.last_name" class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" [(ngModel)]="profile.email" class="form-control" />
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input id="phone" name="phone" [(ngModel)]="profile.phone" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label for="preferred_category_id">Favorite category</label>
              <select
                id="preferred_category_id"
                name="preferred_category_id"
                [(ngModel)]="profile.preferred_category_id"
                class="form-control"
              >
                <option [ngValue]="null">No preference</option>
                @for (category of categories; track category.id) {
                  <option [ngValue]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>
          </section>

          <section class="card p-4">
            <h3>Notifications</h3>

            <label class="toggle-row">
              <input type="checkbox" name="email_notifications" [(ngModel)]="profile.email_notifications" />
              <span>
                <strong>Email notifications</strong>
                <small>Receive booking and account updates by email.</small>
              </span>
            </label>

            <label class="toggle-row">
              <input type="checkbox" name="event_reminders" [(ngModel)]="profile.event_reminders" />
              <span>
                <strong>Event reminders</strong>
                <small>Get reminders before upcoming events you booked.</small>
              </span>
            </label>

            <label class="toggle-row">
              <input type="checkbox" name="marketing_updates" [(ngModel)]="profile.marketing_updates" />
              <span>
                <strong>Promotional updates</strong>
                <small>See announcements about new campus events and offers.</small>
              </span>
            </label>

            <button type="submit" class="btn btn-primary mt-4" [disabled]="isSaving || !settingsForm.form.valid">
              {{ isSaving ? 'Saving...' : 'Save settings' }}
            </button>
          </section>
        </form>
      }
    </div>
  `,
  styles: [`
    .mt-4 { margin-top: 1.5rem; }
    .mt-3 { margin-top: 1rem; }
    .p-4 { padding: 1.5rem; }
    .card { background: var(--card-bg); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--border-color); color: var(--text-color); }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .text-muted { color: var(--muted-text); }
    .settings-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.25rem; }
    .form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; box-sizing: border-box; background: var(--input-bg); color: var(--text-color); }
    .toggle-row { display: flex; gap: 0.9rem; align-items: flex-start; padding: 0.9rem 0; border-bottom: 1px solid var(--border-color); }
    .toggle-row:last-of-type { border-bottom: 0; }
    .toggle-row input { margin-top: 0.3rem; }
    .toggle-row span { display: flex; flex-direction: column; gap: 0.2rem; }
    .toggle-row small { color: var(--muted-text); }
    .btn { padding: 0.75rem 1.2rem; border-radius: 4px; cursor: pointer; text-decoration: none; font-weight: bold; border: none; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-alert, .success-alert { padding: 0.85rem 1rem; border-radius: 4px; margin-bottom: 1rem; }
    .error-alert { background-color: var(--alert-bg); color: var(--alert-text); border-left: 4px solid #d32f2f; }
    .success-alert { background-color: rgba(40, 167, 69, 0.12); color: #1d6b33; border-left: 4px solid #28a745; }
    @media (max-width: 900px) {
      .settings-grid, .form-row { grid-template-columns: 1fr; }
    }
  `]
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
