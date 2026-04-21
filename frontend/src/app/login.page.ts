import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from './api.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="form-layout">
      <div>
        <p class="eyebrow">Account</p>
        <h1>Login with a Django user.</h1>
        <p class="intro dark">Use the admin user created with createsuperuser for the demo.</p>
      </div>

      @if (api.errorMessage()) {
        <p class="error">{{ api.errorMessage() }}</p>
      }

      @if (api.username()) {
        <p class="success">Logged in as {{ api.username() }}. <a routerLink="/sell">Post a listing</a></p>
      }

      <form class="edit-form" (ngSubmit)="login()">
        <label>
          Username
          <input name="username" [(ngModel)]="username" />
        </label>
        <label>
          Password
          <input name="password" type="password" [(ngModel)]="password" />
        </label>
        <button type="submit">Login</button>
      </form>
    </section>
  `
})
export class LoginPage {
  username = '';
  password = '';

  constructor(public api: ApiService, private router: Router) {}

  login(): void {
    this.api.login(this.username, this.password).subscribe(() => this.router.navigateByUrl('/browse'));
  }
}
