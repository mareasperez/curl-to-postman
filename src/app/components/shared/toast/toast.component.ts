import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
    @if (show) {
    <div [class]="'toast ' + type">
      {{ message }}
    </div>
    }
  `,
    styles: [`
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      max-width: 24rem;
      padding: 1rem 1.5rem;
      background: #1e293b;
      color: #f1f5f9;
      border-radius: 0.5rem;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
      border: 1px solid #475569;
      z-index: 1000;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .toast.success {
      border-left: 4px solid #10b981;
    }

    .toast.error {
      border-left: 4px solid #ef4444;
    }

    @media (max-width: 768px) {
      .toast {
        right: 1rem;
        left: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent {
    @Input() message: string = '';
    @Input() type: 'success' | 'error' = 'success';
    @Input() show: boolean = false;
}
