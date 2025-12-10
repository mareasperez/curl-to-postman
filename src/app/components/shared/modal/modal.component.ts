import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    @if (show()) {
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title() }}</h3>
          <button (click)="onClose()" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
      padding: 1rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: #1e293b;
      border-radius: 1rem;
      border: 1px solid #334155;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #334155;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #f1f5f9;
    }

    .modal-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 2rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
      line-height: 1;
    }

    .modal-close:hover {
      background: #334155;
      color: #f1f5f9;
    }

    .modal-body {
      padding: 1.5rem;
    }
  `]
})
export class ModalComponent {
  title = input<string>('');
  show = input<boolean>(false);
  closeClicked = output<void>();

  onClose() {
    this.closeClicked.emit();
  }
}