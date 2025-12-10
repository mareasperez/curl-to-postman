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
    }
  `]
})
export class OutputViewerTabComponent {
  content = input<string>('');
}
