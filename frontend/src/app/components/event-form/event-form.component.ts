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
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
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
