import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { EventsComponent } from './components/events/events.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { OrdersComponent } from './components/orders/orders.component';
import { LoginComponent } from './components/login/login.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RegisterComponent } from './components/register/register.component';
import { ManageEventsComponent } from './components/manage-events/manage-events.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'events', component: EventsComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'manage-events', component: ManageEventsComponent, canActivate: [authGuard, adminGuard] },
  { path: 'manage-events/new', component: EventFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'manage-events/edit/:id', component: EventFormComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
