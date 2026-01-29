import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    @if (show()) {
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md modal-fade"
      (click)="onClose()">
      <div class="flex flex-col w-full md:w-auto md:min-w-[600px] max-w-6xl min-h-[200px] max-h-[95vh] rounded-3xl
        border-2 border-[var(--primary)]
        bg-black/80 backdrop-blur-2xl
        shadow-[0_0_80px_rgba(139,92,246,0.25)]
        modal-slide ring-0 relative overflow-hidden" (click)="$event.stopPropagation()">
        
        <!-- Top Gradient Highlight -->
        <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
        
        <!-- Header -->
        <div
          class="flex-shrink-0 flex items-center justify-between
          px-8 py-6 rounded-t-3xl">
          <h3 class="m-0 text-2xl font-bold text-white tracking-tight">{{ title() }}</h3>
          <button (click)="onClose()"
            class="flex h-10 w-10 items-center justify-center rounded-full text-xl text-white/50 transition
            hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95">✕</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-8 py-2">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="flex-shrink-0 px-8 py-6 rounded-b-3xl">
           <ng-content select="[modal-footer]"></ng-content>
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