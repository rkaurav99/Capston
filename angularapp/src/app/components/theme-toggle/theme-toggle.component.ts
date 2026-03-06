import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppThemeDefinition, AppThemeName, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  isOpen = false;
  themes: AppThemeDefinition[] = [];
  activeTheme: AppThemeName = 'cyber-bunker';

  private themeSubscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.themes = this.themeService.getThemes();
    this.activeTheme = this.themeService.getCurrentTheme();
    this.themeSubscription = this.themeService.currentTheme$.subscribe((theme) => {
      this.activeTheme = theme;
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  togglePanel(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  closePanel(): void {
    this.isOpen = false;
  }

  selectTheme(theme: AppThemeName): void {
    this.themeService.setTheme(theme);
    this.isOpen = false;
  }

  getActiveThemeDefinition(): AppThemeDefinition | undefined {
    return this.themes.find((theme) => theme.key === this.activeTheme);
  }

  trackTheme(index: number, theme: AppThemeDefinition): string {
    return theme.key;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closePanel();
  }
}
