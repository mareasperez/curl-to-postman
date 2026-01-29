import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    @if (show()) {
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm modal-fade"
      (click)="onClose()">
      <div class="w-full max-w-[720px] max-h-[80vh] overflow-y-auto rounded-2xl border border-[var(--border)]
        bg-[linear-gradient(160deg,_var(--card-bg)_0%,_var(--surface-alt)_100%)] shadow-[var(--shadow-hover)]
        modal-slide" (click)="$event.stopPropagation()">
        <div
          class="sticky top-0 z-[1] flex items-center justify-between border-b border-[var(--border)]
          bg-[linear-gradient(160deg,_var(--card-bg)_0%,_var(--surface-alt)_100%)] px-6 py-4">
          <h3 class="m-0 text-xl font-semibold text-[var(--text)]">{{ title() }}</h3>
          <button (click)="onClose()"
            class="flex h-8 w-8 items-center justify-center rounded-full text-2xl text-[var(--text-muted)] transition
            hover:bg-[var(--button-secondary-bg)] hover:text-[var(--text)]">×</button>
        </div>
        <div class="px-6 pb-6 pt-5">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
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

    .modal-fade {
      animation: fadeIn 0.25s ease;
    }

    .modal-slide {
      animation: slideUp 0.3s ease;
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