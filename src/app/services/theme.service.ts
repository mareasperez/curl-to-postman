import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private theme: ThemeMode;

  constructor() {
    this.theme = this.getInitialTheme();
    this.applyTheme(this.theme, false);
  }

  get currentTheme(): ThemeMode {
    return this.theme;
  }

  toggleTheme(): ThemeMode {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.theme, true);
    return this.theme;
  }

  private getInitialTheme(): ThemeMode {
    const stored = this.getStoredTheme();
    if (stored) return stored;

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    return 'dark';
  }

  private getStoredTheme(): ThemeMode | null {
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }

  private applyTheme(theme: ThemeMode, persist: boolean): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch {
        // Ignore storage failures (private mode, blocked, etc.)
      }
    }
  }
}
