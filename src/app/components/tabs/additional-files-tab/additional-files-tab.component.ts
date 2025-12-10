import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdditionalFile } from '../../../models/additional-file.model';

// Re-export for backwards compatibility
export type { AdditionalFile } from '../../../models/additional-file.model';

@Component({
  selector: 'app-additional-files-tab',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 animate-fadeIn">
      @if (files().length > 0) {
        @for (file of files(); track file.name) {
        <div class="env-card">
          <h4>🌍 {{ file.name }}</h4>
          <pre class="code-block"><code>{{ file.data | json }}</code></pre>
        </div>
        }
      } @else {
        <div class="text-center text-gray-400 py-8">
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
      background: #0f172a;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #334155;
    }

    .env-card h4 {
      color: #a78bfa;
      margin-bottom: 1rem;
      font-size: 1.25rem;
      margin-top: 0;
    }

    .code-block {
      padding: 1.5rem;
      background: #0f172a;
      border-radius: 0.5rem;
      color: #f1f5f9;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 600px;
      overflow-y: auto;
      margin: 0;
    }

    .text-center {
      text-align: center;
    }

    .text-gray-400 {
      color: #94a3b8;
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
