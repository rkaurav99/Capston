import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../models/workshop-event.model';
import { WorkshopEventService } from '../../services/workshop-event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredEvents: WorkshopEvent[] = [];
  searchText = '';
  openFaq = -1;

  categories = [
    { name: 'Technology',  icon: 'fas fa-laptop-code',      color: '#3b82f6', bg: '#eff6ff' },
    { name: 'Business',    icon: 'fas fa-briefcase',         color: '#10b981', bg: '#ecfdf5' },
    { name: 'Design',      icon: 'fas fa-palette',           color: '#ec4899', bg: '#fdf2f8' },
    { name: 'Marketing',   icon: 'fas fa-bullhorn',          color: '#f59e0b', bg: '#fffbeb' },
    { name: 'Health',      icon: 'fas fa-heart-pulse',       color: '#ef4444', bg: '#fef2f2' },
    { name: 'Education',   icon: 'fas fa-graduation-cap',    color: '#8b5cf6', bg: '#f5f3ff' },
    { name: 'Arts',        icon: 'fas fa-paintbrush',        color: '#f97316', bg: '#fff7ed' },
    { name: 'Leadership',  icon: 'fas fa-crown',             color: '#6366f1', bg: '#eef2ff' },
  ];

  stats = [
    { value: '500+', label: 'Workshops',   icon: 'fas fa-calendar-check', color: '#6366f1' },
    { value: '12K+', label: 'Attendees',   icon: 'fas fa-users',          color: '#10b981' },
    { value: '80+',  label: 'Speakers',    icon: 'fas fa-microphone',     color: '#f59e0b' },
    { value: '95%',  label: 'Satisfaction',icon: 'fas fa-star',           color: '#ef4444' },
  ];

  testimonials = [
    { name: 'Sarah Johnson',  role: 'Product Designer',    avatar: 'SJ', rating: 5,
      text: 'WorkshopHub completely transformed how I discover professional development. The interface is beautiful and the events are world-class!' },
    { name: 'Michael Chen',   role: 'Software Engineer',   avatar: 'MC', rating: 5,
      text: "I've attended 12 workshops here. Booking is seamless and quality is consistently excellent. Highly recommended for any professional!" },
    { name: 'Priya Sharma',   role: 'Marketing Manager',   avatar: 'PS', rating: 5,
      text: 'As an organizer, the admin tools are incredible. Managing bookings and feedback has never been easier. A game-changer for our team.' },
  ];

  faqs = [
    { q: 'How do I book a workshop?', a: 'Browse our listings, pick a workshop you love, and click "Book Now". Fill in the short form and your spot is secured instantly.' },
    { q: 'Can I cancel or rebook?',   a: 'Yes — contact the organizer or our support team. Cancellation policies may vary per event, so check the event details.' },
    { q: 'Are there online workshops?', a: 'Many events are available both in-person and virtually. Check the location field on each event card for details.' },
    { q: 'How do I become an organizer?', a: 'Register with an admin account using your organisation details. Once set up, you can create and manage workshops immediately.' },
    { q: 'Is my data secure?',        a: 'Absolutely! We use industry-standard encryption for all data. Your personal information is always private and protected.' },
    { q: 'How do I leave feedback?',  a: 'After attending, log in and go to the Feedback section. Rate and review any workshop you\'ve booked — we love hearing from you!' },
  ];

  constructor(
    private workshopService: WorkshopEventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workshopService.getAllWorkshopEvents().subscribe(
      (data: WorkshopEvent[]) => { this.featuredEvents = data.slice(0, 6); },
      () => { this.featuredEvents = []; }
    );
  }

  toggleFaq(i: number): void { this.openFaq = this.openFaq === i ? -1 : i; }
  goLogin():    void { this.router.navigate(['/login']); }
  goRegister(): void { this.router.navigate(['/register']); }

  goDashboard(): void {
    const role = this.authService.getUserRole();
    this.router.navigate([role === 'Admin' ? '/admin/dashboard' : '/user/dashboard']);
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  daysUntil(d: Date | string): number {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  }

  stars(n: number): number[] { return Array(n).fill(0); }
}
