import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WorkshopEvent } from '../../models/workshop-event.model';
import { WorkshopEventService } from '../../services/workshop-event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSectionRef?: ElementRef<HTMLElement>;
  @ViewChild('heroVisuals') heroVisualsRef?: ElementRef<HTMLDivElement>;
  @ViewChild('heroRing') heroRingRef?: ElementRef<HTMLDivElement>;
  @ViewChild('heroGlow') heroGlowRef?: ElementRef<HTMLDivElement>;

  featuredEvents: WorkshopEvent[] = [];
  searchText = '';
  openFaq = -1;

  private animationFrameId: number | null = null;
  private currentOffsetX = 0;
  private currentOffsetY = 0;
  private targetOffsetX = 0;
  private targetOffsetY = 0;
  private reducedMotion = false;

  categories = [
    { name: 'Technology',  icon: 'fas fa-laptop-code',      color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
    { name: 'Business',    icon: 'fas fa-briefcase',         color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    { name: 'Design',      icon: 'fas fa-palette',           color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
    { name: 'Marketing',   icon: 'fas fa-bullhorn',          color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
    { name: 'Health',      icon: 'fas fa-heart-pulse',       color: '#f87171', bg: 'rgba(239,68,68,0.15)'  },
    { name: 'Education',   icon: 'fas fa-graduation-cap',    color: '#c084fc', bg: 'rgba(139,92,246,0.15)' },
    { name: 'Arts',        icon: 'fas fa-paintbrush',        color: '#fb923c', bg: 'rgba(249,115,22,0.15)' },
    { name: 'Leadership',  icon: 'fas fa-crown',             color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
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

  ngAfterViewInit(): void {
    this.reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.updateHeroPointer(72, 28);
    this.applyHeroTransforms();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  toggleFaq(i: number): void { this.openFaq = this.openFaq === i ? -1 : i; }
  goLogin():    void { this.router.navigate(['/login']); }
  goRegister(): void { this.router.navigate(['/register']); }

  handleHeroPrimaryAction(): void {
    this.isLoggedIn() ? this.goDashboard() : this.goRegister();
  }

  handleHeroSecondaryAction(): void {
    this.isLoggedIn() ? this.goDashboard() : this.goLogin();
  }

  handleHeroSearch(): void {
    this.isLoggedIn() ? this.goDashboard() : this.goLogin();
  }

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

  onHeroPointerMove(event: MouseEvent): void {
    if (this.reducedMotion || typeof window === 'undefined' || window.innerWidth < 640) {
      return;
    }

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width) - 0.5;
    const normalizedY = ((event.clientY - rect.top) / rect.height) - 0.5;
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    const motion = window.innerWidth < 1024 ? 22 : 36;

    this.updateHeroPointer(pointerX, pointerY);
    this.targetOffsetX = normalizedX * motion;
    this.targetOffsetY = normalizedY * motion;
    this.startHeroAnimation();
  }

  onHeroPointerLeave(): void {
    this.updateHeroPointer(72, 28);
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.startHeroAnimation();
  }

  private updateHeroPointer(pointerX: number, pointerY: number): void {
    const hero = this.heroSectionRef?.nativeElement;

    if (!hero) {
      return;
    }

    hero.style.setProperty('--pointer-x', `${pointerX}%`);
    hero.style.setProperty('--pointer-y', `${pointerY}%`);
  }

  private startHeroAnimation(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    const animate = (): void => {
      this.currentOffsetX += (this.targetOffsetX - this.currentOffsetX) * 0.10;
      this.currentOffsetY += (this.targetOffsetY - this.currentOffsetY) * 0.10;
      this.applyHeroTransforms();

      const settled = Math.abs(this.targetOffsetX - this.currentOffsetX) < 0.12
        && Math.abs(this.targetOffsetY - this.currentOffsetY) < 0.12;

      if (settled) {
        this.currentOffsetX = this.targetOffsetX;
        this.currentOffsetY = this.targetOffsetY;
        this.applyHeroTransforms();
        this.animationFrameId = null;
        return;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private applyHeroTransforms(): void {
    const visuals = this.heroVisualsRef?.nativeElement;
    const ring = this.heroRingRef?.nativeElement;
    const glow = this.heroGlowRef?.nativeElement;

    if (visuals) {
      visuals.style.transform = `translate3d(${this.currentOffsetX * 0.18}px, ${this.currentOffsetY * 0.18}px, 0)`;
    }

    if (ring) {
      ring.style.transform = `translate3d(${this.currentOffsetX * 0.75}px, ${this.currentOffsetY * 0.75}px, 0) rotate(${this.currentOffsetX * 0.18}deg)`;
    }

    if (glow) {
      glow.style.transform = `translate3d(${this.currentOffsetX * -0.55}px, ${this.currentOffsetY * -0.45}px, 0)`;
    }
  }
}
