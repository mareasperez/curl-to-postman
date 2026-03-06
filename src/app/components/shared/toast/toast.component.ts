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
      top: 2rem;
      right: 2rem;
      max-width: 24rem;
      padding: 0.85rem 1.25rem;
      background: rgba(28, 28, 30, 0.95);
      color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      backdrop-filter: blur(20px);
      animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    :root[data-theme='light'] .toast {
      background: rgba(255, 255, 255, 0.95);
      color: #000000;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .toast.success {
      border-left: 4px solid #34c759;
    }

    .toast.error {
      border-left: 4px solid #ff3b30;
    }

    @media (max-width: 768px) {
      .toast {
        top: 1rem;
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
