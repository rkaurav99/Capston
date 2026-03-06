import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppThemeName = 'cyber-bunker' | 'minimalist' | 'royal-blue' | 'tokyo';

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
      key: 'cyber-bunker',
      name: 'Cyber Bunker',
      tagline: 'Glowing command center',
      description: 'Dark graphite panels with premium yellow neon accents and a high-end AI console feel.',
      icon: 'fas fa-shield-halved',
      preview: ['#09090b', '#111827', '#facc15', '#fde047']
    },
    {
      key: 'minimalist',
      name: 'Minimalist',
      tagline: 'Quiet luxury',
      description: 'A bright refined workspace with soft grays, subtle contrast, and elegant restraint.',
      icon: 'fas fa-circle-half-stroke',
      preview: ['#f8fafc', '#ffffff', '#cbd5e1', '#94a3b8']
    },
    {
      key: 'royal-blue',
      name: 'Royal Blue',
      tagline: 'Executive dashboard',
      description: 'Deep navy surfaces, premium sapphire highlights, and polished enterprise depth.',
      icon: 'fas fa-gem',
      preview: ['#0f172a', '#172554', '#2563eb', '#60a5fa']
    },
    {
      key: 'tokyo',
      name: 'Tokyo',
      tagline: 'Neon future grid',
      description: 'A cool cyber aesthetic with teal-cyan glows inspired by futuristic SaaS interfaces.',
      icon: 'fas fa-bolt-lightning',
      preview: ['#06131a', '#0f2b33', '#14b8a6', '#22d3ee']
    }
  ];

  private readonly currentThemeSubject = new BehaviorSubject<AppThemeName>('cyber-bunker');
  readonly currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  initializeTheme(): void {
    const storedTheme = this.readStoredTheme();
    const initialTheme = storedTheme ?? 'cyber-bunker';
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
    body.style.setProperty('color-scheme', theme === 'minimalist' ? 'light' : 'dark');

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
