import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
    @if (show) {
    <div class="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] animate-bounce-in">
        <div class="px-8 py-3.5 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/40 shadow-soft-lg flex items-center gap-4 min-w-[300px] max-w-[90vw]">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                 [class.bg-green-100]="type === 'success'" [class.text-green-600]="type === 'success'"
                 [class.bg-red-100]="type === 'error'" [class.text-red-600]="type === 'error'">
                @if (type === 'success') { <span>✓</span> }
                @else { <span>!</span> }
            </div>
            <span class="text-sm font-bold text-text truncate">{{ message }}</span>
        </div>
    </div>
    }
  `,
    styles: [`
    @keyframes bounceIn {
      0% { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
      70% { opacity: 1; transform: translate(-50%, 5px) scale(1.02); }
      100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    .animate-bounce-in {
      animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
  `]
})
export class ToastComponent {
    @Input() message: string = '';
    @Input() type: 'success' | 'error' = 'success';
    @Input() show: boolean = false;
}
