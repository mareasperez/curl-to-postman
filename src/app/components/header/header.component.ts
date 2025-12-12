import { Component, inject } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';

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

  onInfoClick(): void {
    this.appState.toggleFeaturesModal();
  }
}
