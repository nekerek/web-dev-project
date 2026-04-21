import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from './api.service';
import { Listing } from './models';

@Component({
  selector: 'app-browse-page',
  imports: [FormsModule],
  template: `
    <section class="search-band" aria-labelledby="marketplace-title">
      <div>
        <p class="eyebrow">Student-only exchange</p>
        <h1 id="marketplace-title">Buy, sell, and swap around campus.</h1>
        <p class="intro">Find books, dorm gear, bikes, tech, and study supplies from students nearby.</p>
      </div>

      <form class="search-panel" (ngSubmit)="searchListings()">
        <label for="search">Search listings</label>
        <div class="search-row">
          <input id="search" name="search" type="search" [(ngModel)]="searchText" placeholder="Textbooks, desks, calculators" />
          <button type="submit">Search</button>
        </div>
      </form>
    </section>

    <section class="category-strip">
      <button type="button" (click)="loadFeatured()">Featured</button>
      <button type="button" (click)="loadListings()">All listings</button>
      <button type="button" (click)="clearSearch()">Clear search</button>
    </section>

    @if (api.errorMessage()) {
      <p class="error">{{ api.errorMessage() }}</p>
    }

    <section class="listing-grid" aria-label="Marketplace listings">
      @for (listing of filteredListings; track listing.id) {
        <article class="listing-card">
          <div class="listing-body">
            <p class="price">\${{ listing.price }}</p>
            <h2>{{ listing.title }}</h2>
            <p>{{ listing.description }}</p>
            <p>{{ listing.category_name }} - {{ listing.campus_location }}</p>
            <button type="button" (click)="deleteListing(listing.id)">Delete</button>
          </div>
        </article>
      } @empty {
        <p class="empty-state">No listings yet. Add one from the Sell page.</p>
      }
    </section>
  `
})
export class BrowsePage implements OnInit {
  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  searchText = '';

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.api.getListings().subscribe((listings) => {
      this.listings = listings;
      this.filteredListings = listings;
    });
  }

  loadFeatured(): void {
    this.api.getFeaturedListings().subscribe((listings) => {
      this.listings = listings;
      this.filteredListings = listings;
    });
  }

  searchListings(): void {
    const query = this.searchText.trim().toLowerCase();
    this.filteredListings = query
      ? this.listings.filter((listing) => listing.title.toLowerCase().includes(query) || listing.description.toLowerCase().includes(query))
      : this.listings;
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredListings = this.listings;
  }

  deleteListing(id: number): void {
    this.api.deleteListing(id).subscribe(() => this.loadListings());
  }
}
