import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AdminWorkshopEventListComponent } from './components/admin/admin-workshop-event-list/admin-workshop-event-list.component';
import { AddWorkshopEventComponent } from './components/admin/add-workshop-event/add-workshop-event.component';
import { EditWorkshopEventComponent } from './components/admin/edit-workshop-event/edit-workshop-event.component';
import { AdminBookingsComponent } from './components/admin/admin-bookings/admin-bookings.component';
import { AdminFeedbacksComponent } from './components/admin/admin-feedbacks/admin-feedbacks.component';
import { UserWorkshopEventListComponent } from './components/user/user-workshop-event-list/user-workshop-event-list.component';
import { AddBookingComponent } from './components/user/add-booking/add-booking.component';
import { UserMyBookingsComponent } from './components/user/user-my-bookings/user-my-bookings.component';
import { UserFeedbackComponent } from './components/user/user-feedback/user-feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    AdminWorkshopEventListComponent,
    AddWorkshopEventComponent,
    EditWorkshopEventComponent,
    AdminBookingsComponent,
    AdminFeedbacksComponent,
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
