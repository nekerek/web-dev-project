import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService } from './api.service';
import { Category, ListingPayload } from './models';

@Component({
  selector: 'app-sell-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="form-layout">
      <div>
        <p class="eyebrow">Post an item</p>
        <h1>List something for students nearby.</h1>
        <p class="intro dark">Objects are linked to the authenticated user on the backend.</p>
      </div>

      @if (!api.username()) {
        <p class="error">Login first, then post a listing. <a routerLink="/login">Go to login</a></p>
      }

      @if (api.errorMessage()) {
        <p class="error">{{ api.errorMessage() }}</p>
      }

      <form class="edit-form" (ngSubmit)="createListing()">
        <label>
          Title
          <input name="title" [(ngModel)]="form.title" placeholder="Calculus textbook" />
        </label>
        <label>
          Description
          <textarea name="description" [(ngModel)]="form.description" placeholder="Condition, pickup details, notes"></textarea>
        </label>
        <label>
          Price
          <input name="price" type="number" [(ngModel)]="form.price" />
        </label>
        <label>
          Campus location
          <input name="campus_location" [(ngModel)]="form.campus_location" placeholder="Library lobby" />
        </label>
        <label>
          Category
          <select name="category" [(ngModel)]="form.category">
            @for (category of categories; track category.id) {
              <option [ngValue]="category.id">{{ category.name }}</option>
            }
          </select>
        </label>
        <button type="submit">Create listing</button>
      </form>
    </section>
  `
})
export class SellPage implements OnInit {
  categories: Category[] = [];
  form: ListingPayload = {
    category: null,
    title: '',
    description: '',
    price: null,
    campus_location: ''
  };

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    this.api.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.form.category = categories[0]?.id ?? null;
    });
  }

  createListing(): void {
    this.api.createListing(this.form).subscribe(() => {
      this.form = {
        category: this.categories[0]?.id ?? null,
        title: '',
        description: '',
        price: null,
        campus_location: ''
      };
    });
  }
}
