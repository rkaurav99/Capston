import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showSidebar = false;
  sidebarCollapsed = false;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.initializeTheme();
    this.checkRoute(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.checkRoute(e.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {}

  private checkRoute(url: string): void {
    const publicPaths = ['/', '/home', '/login', '/register'];
    this.showSidebar = !publicPaths.some(p => url === p || url.startsWith(p + '?'));
  }

}
