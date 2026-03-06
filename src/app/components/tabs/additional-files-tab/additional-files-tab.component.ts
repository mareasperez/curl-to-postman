import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdditionalFile } from '@models/additional-file.model';

// Re-export for backwards compatibility
export type { AdditionalFile } from '@models/additional-file.model';

@Component({
  selector: 'app-additional-files-tab',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 animate-fadeIn">
      @if (files().length > 0) {
        @for (file of files(); track file.name) {
        <div class="env-card">
          <h4>{{ file.name }}</h4>
          <pre class="code-block"><code>{{ file.data | json }}</code></pre>
        </div>
        }
      } @else {
        <div class="text-center text-muted py-8">
          <p>No additional files for this format</p>
        </div>
      }
    </div>
  `,
  styles: [`
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

    .animate-fadeIn {
      animation: fadeIn 0.25s ease;
    }

    .flex {
      display: flex;
    }

    .flex-col {
      flex-direction: column;
    }

    .gap-6 {
      gap: 1.5rem;
    }

    .env-card {
      background: color-mix(in srgb, var(--surface-solid) 88%, transparent 12%);
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
    }

    .env-card h4 {
      color: var(--text);
      margin-bottom: 0.65rem;
      font-size: 0.95rem;
      margin-top: 0;
    }

    .code-block {
      padding: 1rem;
      background: color-mix(in srgb, var(--surface-2) 92%, transparent 8%);
      border-radius: 0.62rem;
      border: 1px solid var(--border);
      color: var(--text);
      font-family: 'Courier New', monospace;
      font-size: 0.82rem;
      /* Desktop: Standard scroll */
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    /* Mobile: Force wrap and max height */
    @media (max-width: 768px) {
      .code-block {
        overflow-x: hidden;
        word-break: break-all;
        max-height: calc(100dvh - 660px);
        overflow-y: auto;
      }
    }

    .text-center {
      text-align: center;
    }

    .text-muted {
      color: var(--text-muted);
    }

    .py-8 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  `]
})
export class AdditionalFilesTabComponent {
  files = input<AdditionalFile[]>([]);
}
