import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

// Public components
import { HomeComponent } from './components/home/home.component';

// Auth components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// Admin components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminWorkshopEventListComponent } from './components/admin/admin-workshop-event-list/admin-workshop-event-list.component';
import { AddWorkshopEventComponent } from './components/admin/add-workshop-event/add-workshop-event.component';
import { EditWorkshopEventComponent } from './components/admin/edit-workshop-event/edit-workshop-event.component';
import { AdminBookingsComponent } from './components/admin/admin-bookings/admin-bookings.component';
import { AdminFeedbacksComponent } from './components/admin/admin-feedbacks/admin-feedbacks.component';

// User components
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { UserWorkshopEventListComponent } from './components/user/user-workshop-event-list/user-workshop-event-list.component';
import { AddBookingComponent } from './components/user/add-booking/add-booking.component';
import { UserMyBookingsComponent } from './components/user/user-my-bookings/user-my-bookings.component';
import { UserFeedbackComponent } from './components/user/user-feedback/user-feedback.component';
import { UserFavoritesComponent } from './components/user/user-favorites/user-favorites.component';

// Shared / Profile
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';

const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin routes (protected by AuthGuard)
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/workshop-events', component: AdminWorkshopEventListComponent, canActivate: [AuthGuard] },
  { path: 'admin/add-workshop-event', component: AddWorkshopEventComponent, canActivate: [AuthGuard] },
  { path: 'admin/edit-workshop-event/:id', component: EditWorkshopEventComponent, canActivate: [AuthGuard] },
  { path: 'admin/bookings', component: AdminBookingsComponent, canActivate: [AuthGuard] },
  { path: 'admin/feedbacks', component: AdminFeedbacksComponent, canActivate: [AuthGuard] },

  // User routes (protected by AuthGuard)
  { path: 'user/dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'user/workshop-events', component: UserWorkshopEventListComponent, canActivate: [AuthGuard] },
  { path: 'user/book-event/:eventId', component: AddBookingComponent, canActivate: [AuthGuard] },
  { path: 'user/my-bookings', component: UserMyBookingsComponent, canActivate: [AuthGuard] },
  { path: 'user/feedback', component: UserFeedbackComponent, canActivate: [AuthGuard] },
  { path: 'user/favorites', component: UserFavoritesComponent, canActivate: [AuthGuard] },

  // Shared
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard] },

  // Wildcard
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
