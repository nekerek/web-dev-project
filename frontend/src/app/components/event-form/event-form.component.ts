import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../services/event/event.service';
import { Category } from '../../models/interfaces';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4 mb-5">
      <div class="card form-card">
        <h2 class="mb-4 text-center">{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h2>
        
        @if (errorMessage) {
          <div class="error-alert">{{ errorMessage }}</div>
        }
        
        <form (ngSubmit)="onSubmit()" #eventForm="ngForm">
          <div class="row">
            <div class="col-md-6 form-group">
              <label for="title">Event Title <span class="text-danger">*</span></label>
              <input type="text" id="title" name="title" [(ngModel)]="eventData.title" required class="form-control" placeholder="E.g., KBTU Music Festival">
            </div>
            
            <div class="col-md-6 form-group">
              <label for="category">Category <span class="text-danger">*</span></label>
              <select id="category" name="category" [(ngModel)]="eventData.category_id" required class="form-control">
                <option value="" disabled selected>Select a category</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Description <span class="text-danger">*</span></label>
            <textarea id="description" name="description" [(ngModel)]="eventData.description" required class="form-control" rows="4" placeholder="Detailed description of the event..."></textarea>
          </div>
          
          <div class="row">
            <div class="col-md-6 form-group">
              <label for="date">Date and Time <span class="text-danger">*</span></label>
              <input type="datetime-local" id="date" name="date" [(ngModel)]="eventData.date" required class="form-control">
            </div>
            
            <div class="col-md-6 form-group">
              <label for="location">Location <span class="text-danger">*</span></label>
              <input type="text" id="location" name="location" [(ngModel)]="eventData.location" required class="form-control" placeholder="E.g., Main Hall, KBTU">
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-4 form-group">
              <label for="price">Price (KZT) <span class="text-danger">*</span></label>
              <input type="number" id="price" name="price" [(ngModel)]="eventData.price" required min="0" step="0.01" class="form-control" placeholder="0.00">
            </div>
            
            <div class="col-md-4 form-group">
              <label for="total_seats">Total Seats <span class="text-danger">*</span></label>
              <input type="number" id="total_seats" name="total_seats" [(ngModel)]="eventData.total_seats" required min="1" class="form-control">
            </div>
            
            <div class="col-md-4 form-group">
              <label for="organization">Organization</label>
              <input type="text" id="organization" name="organization" [(ngModel)]="eventData.organization" class="form-control" placeholder="E.g., Student Council">
            </div>
          </div>
          
          <div class="form-group">
            <label for="image">Event Poster</label>
            <input type="file" id="image" (change)="onFileSelected($event)" class="form-control" accept="image/*">
            <small class="text-muted mt-1 d-block">Recommended size: 800x600px. Max size: 2MB.</small>
          </div>
          
          <div class="form-actions mt-4 d-flex justify-between">
            <a routerLink="/manage-events" class="btn btn-outline">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="!eventForm.form.valid || isLoading">
              {{ isLoading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Publish Event') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: var(--card-bg); padding: 2.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; border: 1px solid var(--border-color); color: var(--text-color); }
    .text-center { text-align: center; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-5 { margin-top: 3rem; }
    .mb-5 { margin-bottom: 3rem; }
    .text-danger { color: #dc3545; }
    .text-muted { color: var(--muted-text); }
    .d-block { display: block; }
    .d-flex { display: flex; }
    .justify-between { justify-content: space-between; }
    
    .row { display: flex; flex-wrap: wrap; margin: 0 -10px; }
    .col-md-6 { flex: 0 0 calc(50% - 20px); max-width: calc(50% - 20px); margin: 0 10px; }
    .col-md-4 { flex: 0 0 calc(33.333% - 20px); max-width: calc(33.333% - 20px); margin: 0 10px; }
    @media (max-width: 768px) { .col-md-6, .col-md-4 { flex: 0 0 calc(100% - 20px); max-width: calc(100% - 20px); } }
    
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--input-border); border-radius: 4px; box-sizing: border-box; background: var(--input-bg); color: var(--text-color); font-family: inherit; }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(0,53,128,0.2); }
    
    .btn { padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; text-decoration: none; font-weight: bold; border: none; font-size: 1rem; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .btn-outline { background-color: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
    .btn-outline:hover { background-color: var(--table-hover); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .error-alert { padding: 1rem; background-color: var(--alert-bg); color: var(--alert-text); border-radius: 4px; margin-bottom: 1.5rem; border-left: 4px solid #d32f2f; }
  `]
})
export class EventFormComponent implements OnInit {
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  eventId: number | null = null;
  isLoading = false;
  errorMessage = '';
  categories: Category[] = [];
  
  selectedFile: File | null = null;

  eventData = {
    title: '',
    category_id: '',
    description: '',
    date: '',
    location: '',
    price: '',
    total_seats: '',
    organization: ''
  };

  ngOnInit() {
    this.loadCategories();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.eventId = +idParam;
      this.loadEventData();
    }
  }

  loadCategories() {
    this.eventService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  loadEventData() {
    if (!this.eventId) return;
    
    this.isLoading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        // Format date to local datetime-local input format (YYYY-MM-DDThh:mm)
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toISOString().slice(0, 16);
        
        this.eventData = {
          title: event.title,
          category_id: event.category.id.toString(),
          description: event.description,
          date: formattedDate,
          location: event.location,
          price: event.price.toString(),
          total_seats: event.total_seats.toString(),
          organization: event.organization || ''
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load event data. It might not exist.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const formData = new FormData();
    formData.append('title', this.eventData.title);
    formData.append('category_id', this.eventData.category_id);
    formData.append('description', this.eventData.description);
    
    // Ensure the date is a valid ISO format string for Django
    const dateObj = new Date(this.eventData.date);
    formData.append('date', dateObj.toISOString());
    
    formData.append('location', this.eventData.location);
    formData.append('price', this.eventData.price);
    formData.append('total_seats', this.eventData.total_seats);
    formData.append('organization', this.eventData.organization);
    formData.append('is_active', 'true');
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    
    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, formData).subscribe({
        next: () => {
          this.router.navigate(['/manage-events']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update event. Please check all fields.';
          console.error(err);
        }
      });
    } else {
      this.eventService.createEvent(formData).subscribe({
        next: () => {
          this.router.navigate(['/manage-events']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create event. Please check all fields.';
          console.error(err);
        }
      });
    }
  }
}
