import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-output-viewer-tab',
  imports: [CommonModule],
  template: `
    <div class="animate-fadeIn">
      <pre class="code-block"><code>{{ content() }}</code></pre>
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

    .code-block {
      padding: 1rem;
      background: color-mix(in srgb, var(--surface-solid) 90%, transparent 10%);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      color: var(--text);
      font-family: 'Courier New', monospace;
      font-size: 0.82rem;
      overflow-x: hidden; /* Force wrap, no horizontal scroll */
      white-space: pre-wrap;
      word-break: break-all;
      margin: 0;
      max-height: calc(100dvh - 580px);
      overflow-y: auto;
    }
  `]
})
export class OutputViewerTabComponent {
  content = input<string>('');
}
