import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppThemeName = 'light' | 'dark';

export interface AppThemeDefinition {
  key: AppThemeName;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  preview: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'workshophub-theme';
  private readonly themeClassPrefix = 'theme-';

  private readonly themeDefinitions: AppThemeDefinition[] = [
    {
      key: 'light',
      name: 'Light',
      tagline: 'Clean and focused',
      description: 'Bright minimal surfaces with subtle contrast and high readability.',
      icon: 'fas fa-sun',
      preview: ['#f6f7fb', '#ffffff', '#0f172a', '#94a3b8']
    },
    {
      key: 'dark',
      name: 'Dark',
      tagline: 'Modern and sleek',
      description: 'Dark neutral surfaces with balanced highlights for long sessions.',
      icon: 'fas fa-moon',
      preview: ['#0b1220', '#111827', '#f8fafc', '#334155']
    }
  ];

  private readonly currentThemeSubject = new BehaviorSubject<AppThemeName>('light');
  readonly currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  initializeTheme(): void {
    const storedTheme = this.readStoredTheme();
    const initialTheme = storedTheme ?? 'light';
    this.applyTheme(initialTheme);
  }

  setTheme(theme: AppThemeName): void {
    this.applyTheme(theme);
  }

  getCurrentTheme(): AppThemeName {
    return this.currentThemeSubject.value;
  }

  getThemes(): AppThemeDefinition[] {
    return this.themeDefinitions;
  }

  private applyTheme(theme: AppThemeName): void {
    const root = this.document.documentElement;
    const body = this.document.body;
    const allThemeClasses = this.themeDefinitions.map((item) => `${this.themeClassPrefix}${item.key}`);

    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);
    body.classList.remove(...allThemeClasses);
    body.classList.add(`${this.themeClassPrefix}${theme}`);
    body.style.setProperty('color-scheme', theme === 'dark' ? 'dark' : 'light');

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }

    this.currentThemeSubject.next(theme);
  }

  private readStoredTheme(): AppThemeName | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(this.storageKey);
    return this.isTheme(value) ? value : null;
  }

  private isTheme(value: string | null): value is AppThemeName {
    return this.themeDefinitions.some((theme) => theme.key === value);
  }
}
