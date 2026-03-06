import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    @if (show()) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm modal-fade"
        (click)="onClose()"
      >
        <div class="modal-shell modal-slide" (click)="$event.stopPropagation()">
          <div
            class="flex-shrink-0 flex items-center justify-between px-6 py-4 rounded-t-2xl border-b border-[var(--border)]"
          >
            <h3 class="m-0 text-xl font-bold tracking-tight text-[var(--text)]">{{ title() }}</h3>
            <button
              (click)="onClose()"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-[var(--text-muted)] transition
            hover:bg-[var(--surface-2)] hover:text-[var(--text)] active:scale-95"
            >
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4">
            <ng-content></ng-content>
          </div>

          <div class="flex-shrink-0 px-6 py-4 rounded-b-2xl border-t border-[var(--border)]">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
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

      .modal-shell {
        display: flex;
        flex-direction: column;
        width: min(100%, 760px);
        max-height: min(88vh, 880px);
        border-radius: 1rem;
        border: 1px solid var(--border);
        background: var(--surface-solid);
        box-shadow: var(--shadow-md);
      }

      .modal-slide {
        animation: slideUp 0.3s ease;
      }
    `,
  ],
})
export class ModalComponent {
  title = input<string>('');
  show = input<boolean>(false);
  closeClicked = output<void>();

  onClose() {
    this.closeClicked.emit();
  }
}
