import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Import components
import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/shared/toast/toast.component';

/**
 * Root application component
 * Simple shell with header, router outlet, and toast
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
export class App { }
