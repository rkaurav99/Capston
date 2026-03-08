import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppThemeDefinition, AppThemeName, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  themes: AppThemeDefinition[] = [];
  activeTheme: AppThemeName = 'light';

  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

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

  selectTheme(theme: AppThemeName): void {
    this.themeService.setTheme(theme);
  }

  getActiveThemeDefinition(): AppThemeDefinition | undefined {
    return this.themes.find((theme) => theme.key === this.activeTheme);
  }

  trackTheme(index: number, theme: AppThemeDefinition): string {
    return theme.key;
  }
}
