import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Public
import { HomeComponent } from './components/home/home.component';

// Auth
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// Shared
import { NavbarComponent } from './components/navbar/navbar.component';

// Admin
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminWorkshopEventListComponent } from './components/admin/admin-workshop-event-list/admin-workshop-event-list.component';
import { AddWorkshopEventComponent } from './components/admin/add-workshop-event/add-workshop-event.component';
import { EditWorkshopEventComponent } from './components/admin/edit-workshop-event/edit-workshop-event.component';
import { AdminBookingsComponent } from './components/admin/admin-bookings/admin-bookings.component';
import { AdminFeedbacksComponent } from './components/admin/admin-feedbacks/admin-feedbacks.component';

// User
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { UserWorkshopEventListComponent } from './components/user/user-workshop-event-list/user-workshop-event-list.component';
import { AddBookingComponent } from './components/user/add-booking/add-booking.component';
import { UserMyBookingsComponent } from './components/user/user-my-bookings/user-my-bookings.component';
import { UserFeedbackComponent } from './components/user/user-feedback/user-feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    AdminDashboardComponent,
    AdminWorkshopEventListComponent,
    AddWorkshopEventComponent,
    EditWorkshopEventComponent,
    AdminBookingsComponent,
    AdminFeedbacksComponent,
    UserDashboardComponent,
    UserWorkshopEventListComponent,
    AddBookingComponent,
    UserMyBookingsComponent,
    UserFeedbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
