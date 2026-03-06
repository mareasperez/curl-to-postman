import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
    @if (show) {
    <div class="toast-wrap">
        <div class="toast-card animate-bounce-in">
            <div class="toast-icon" [class.toast-success]="type === 'success'" [class.toast-error]="type === 'error'">
                @if (type === 'success') { <span>✓</span> } @else { <span>!</span> }
            </div>
            <span class="toast-message">{{ message }}</span>
        </div>
    </div>
    }
  `,
    styles: [`
    @keyframes bounceIn {
      0% { opacity: 0; transform: translateY(-10px) scale(0.96); }
      70% { opacity: 1; transform: translateY(3px) scale(1.01); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .toast-wrap {
      position: fixed;
      top: 0.55rem;
      left: 0;
      right: 0;
      z-index: 2000;
      display: flex;
      justify-content: center;
      padding: 0 0.5rem;
      pointer-events: none;
    }

    .toast-card {
      width: 100%;
      max-width: 520px;
      display: flex;
      align-items: center;
      gap: 0.7rem;
      border-radius: 0.9rem;
      border: 1px solid var(--border);
      background: color-mix(in srgb, var(--surface-solid) 84%, transparent 16%);
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-md);
      padding: 0.72rem 0.8rem;
    }

    .toast-icon {
      width: 1.7rem;
      height: 1.7rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      flex-shrink: 0;
    }

    .toast-success {
      color: #065f46;
      background: #d1fae5;
    }

    .toast-error {
      color: #991b1b;
      background: #fee2e2;
    }

    .toast-message {
      color: var(--text);
      font-size: 0.84rem;
      font-weight: 700;
      line-height: 1.35;
      word-break: break-word;
    }

    .animate-bounce-in {
      animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    @media (min-width: 640px) {
      .toast-wrap {
        top: 1rem;
        padding: 0 1rem;
      }

      .toast-card {
        width: auto;
        min-width: 300px;
        max-width: min(680px, 92vw);
        border-radius: 999px;
        padding: 0.78rem 1rem;
      }
    }
  `]
})
export class ToastComponent {
    @Input() message: string = '';
    @Input() type: 'success' | 'error' = 'success';
    @Input() show: boolean = false;
}
