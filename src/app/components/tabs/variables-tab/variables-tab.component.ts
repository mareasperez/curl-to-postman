import { Component, input, output } from '@angular/core';
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
            <div class="var-main">
              <span class="var-name">{{ variable.name }}</span>
              <span class="var-meta">Used {{ variable.count }} times</span>
            </div>
            <input class="var-input" [value]="variable.value" (blur)="onHostBlur(variable.name, $event)" />
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
            <div class="var-main">
              <span class="var-name">{{ variable.name }}</span>
              <span class="var-meta">Used {{ variable.count }} times</span>
              @if (variable.removed) {
              <span class="removed-badge">Removed from export</span>
              }
            </div>
            <input class="var-input" [value]="variable.value" (blur)="onTokenBlur(variable.name, $event)" />
            <div class="token-actions">
              <button type="button" class="mini-btn" (click)="sanitizeToken(variable.name)">Sanitize</button>
              <button type="button" class="mini-btn" (click)="clearToken(variable.name)">Clear</button>
              <button type="button" class="mini-btn danger" (click)="toggleRemove(variable.name, !variable.removed)">
                {{ variable.removed ? 'Restore' : 'Remove' }}
              </button>
            </div>
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
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column; /* Mobile first: Stack */
      align-items: flex-start;
      gap: 0.5rem;
    }

    @media (min-width: 768px) {
        .var-item {
            gap: 0.6rem;
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

    .var-meta {
      color: var(--text-muted);
      font-size: 0.78rem;
      word-break: break-all;
      width: 100%;
    }

    .var-main {
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.55rem;
    }

    .var-input {
      width: 100%;
      height: 2.2rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
      padding: 0 0.65rem;
      font-size: 0.82rem;
      font-family: 'Courier New', monospace;
    }

    .removed-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--warning);
      border: 1px solid color-mix(in srgb, var(--warning) 50%, var(--border) 50%);
      border-radius: 999px;
      padding: 0.15rem 0.45rem;
    }

    .token-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      width: 100%;
    }

    .mini-btn {
      height: 1.9rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0 0.6rem;
      cursor: pointer;
    }

    .mini-btn.danger {
      border-color: color-mix(in srgb, var(--danger) 45%, var(--border) 55%);
      color: var(--danger);
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
  hostValueChanged = output<{ name: string; value: string }>();
  tokenValueChanged = output<{ name: string; value: string }>();
  tokenSanitized = output<string>();
  tokenCleared = output<string>();
  tokenRemoveToggled = output<{ name: string; removed: boolean }>();

  onHostBlur(name: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.hostValueChanged.emit({ name, value });
  }

  onTokenBlur(name: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.tokenValueChanged.emit({ name, value });
  }

  sanitizeToken(name: string) {
    this.tokenSanitized.emit(name);
  }

  clearToken(name: string) {
    this.tokenCleared.emit(name);
  }

  toggleRemove(name: string, removed: boolean) {
    this.tokenRemoveToggled.emit({ name, removed });
  }
}
