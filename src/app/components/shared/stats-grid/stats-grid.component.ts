import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stat } from '@models/stat.model';

// Re-export for backwards compatibility
export type { Stat } from '@models/stat.model';

@Component({
  selector: 'app-stats-grid',
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      @for (stat of stats(); track stat.label) {
      <button type="button" class="stat-card" (click)="onStatClick(stat.label)" [attr.aria-label]="'Open ' + stat.label">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </button>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    .stat-card {
      appearance: none;
      background: color-mix(in srgb, var(--surface-solid) 88%, transparent 12%);
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      text-align: center;
      transition: all 0.25s ease;
      cursor: pointer;
      width: 100%;
      color: inherit;
      font: inherit;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-strong);
    }

    .stat-icon {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--brand);
      margin-bottom: 0.125rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class StatsGridComponent {
  stats = input<Stat[]>([]);
  statClicked = output<string>();

  onStatClick(label: string): void {
    this.statClicked.emit(label);
  }
}
