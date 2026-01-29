import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { ThemeService } from '../../services/theme.service';

/**
 * Header component - displays app title and info button
 * Uses AppStateService for modal state
 */
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private appState = inject(AppStateService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }

  onInfoClick(): void {
    this.appState.toggleFeaturesModal();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDark(): boolean {
    return this.themeService.currentTheme === 'dark';
  }
}
