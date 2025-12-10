import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Variable {
  name: string;
  value: string;
  count: number;
}

@Component({
  selector: 'app-variables-tab',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 animate-fadeIn">
      @if (hostVariables().length > 0) {
      <div class="var-group">
        <h4 class="text-gray-100 mb-4 text-lg font-semibold">🌐 Host Variables</h4>
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
        <h4 class="text-gray-100 mb-4 text-lg font-semibold">🔑 Token Variables</h4>
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
      background: #0f172a;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border-left: 4px solid #8b5cf6;
    }

    .var-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .var-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .var-item:last-child {
      border-bottom: none;
    }

    .var-name {
      font-weight: 600;
      color: #60a5fa;
      font-family: 'Courier New', monospace;
    }

    .var-value {
      color: #94a3b8;
      font-size: 0.875rem;
      word-break: break-all;
    }

    .text-gray-100 {
      color: #f1f5f9;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .text-lg {
      font-size: 1.125rem;
    }

    .font-semibold {
      font-weight: 600;
    }
  `]
})
export class VariablesTabComponent {
  hostVariables = input<Variable[]>([]);
  tokenVariables = input<Variable[]>([]);
}
