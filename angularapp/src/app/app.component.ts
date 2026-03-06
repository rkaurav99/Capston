import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showSidebar = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this.checkRoute(e.urlAfterRedirects));
  }

  private checkRoute(url: string): void {
    const publicPaths = ['/', '/home', '/login', '/register'];
    this.showSidebar = !publicPaths.some(p => url === p || url.startsWith(p + '?'));
  }
}
