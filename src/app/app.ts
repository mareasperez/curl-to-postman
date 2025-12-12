import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppStateService } from './services/app-state.service';

// Import components
import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/shared/toast/toast.component';

/**
 * Root application component
 * Minimal logic - delegates to AppStateService and child components
 */
@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  private appState = inject(AppStateService);

  // Route detection
  isResultsView = signal(false);

  constructor() {
    // Detect route changes
    this.updateRouteState();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateRouteState();
    });
  }

  private updateRouteState(): void {
    this.isResultsView.set(this.router.url.includes('/results'));
  }
}
