import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable } from '../../../models/variable.model';

// Re-export for backwards compatibility
export type { Variable } from '../../../models/variable.model';

@Component({
  selector: 'app-variables-tab',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 animate-fadeIn">
      @if (hostVariables().length > 0) {
      <div class="var-group">
        <h4 class="title">Host Variables</h4>
        <ul class="var-list">
          @for (variable of hostVariables(); track variable.name) {
          <li class="var-item">
            <span class="var-name">{{ variable.name }}</span>
            <span class="var-value">{{ variable.value }} (usado {{ variable.count }} veces)</span>
          </li>
          }
        </ul>
      </div>
      }

      @if (tokenVariables().length > 0) {
      <div class="var-group">
        <h4 class="title">Token Variables</h4>
        <ul class="var-list">
          @for (variable of tokenVariables(); track variable.name) {
          <li class="var-item">
            <span class="var-name">{{ variable.name }}</span>
            <span class="var-value">{{ variable.value }} (usado {{ variable.count }} veces)</span>
          </li>
          }
        </ul>
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

    .var-group {
      background: color-mix(in srgb, var(--surface-solid) 88%, transparent 12%);
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
    }

    .var-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .var-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column; /* Mobile first: Stack */
      align-items: flex-start;
      gap: 0.25rem;
    }

    @media (min-width: 768px) {
        .var-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
             gap: 1rem;
        }
        
        .var-value {
             text-align: right;
        }
    }

    .var-item:last-child {
      border-bottom: none;
    }

    .var-name {
      font-weight: 600;
      color: var(--brand);
      font-family: 'Courier New', monospace;
      word-break: break-all;
    }

    .var-value {
      color: var(--text-muted);
      font-size: 0.875rem;
      word-break: break-all;
      width: 100%; /* Ensure it breaks properly */
    }

    .title {
      margin: 0 0 0.75rem;
      color: var(--text);
      font-size: 0.95rem;
      font-weight: 750;
    }
  `]
})
export class VariablesTabComponent {
  hostVariables = input<Variable[]>([]);
  tokenVariables = input<Variable[]>([]);
}
