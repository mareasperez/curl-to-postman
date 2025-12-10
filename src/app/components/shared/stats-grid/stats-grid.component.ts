import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stat } from '../../../models/stat.model';

// Re-export for backwards compatibility
export type { Stat } from '../../../models/stat.model';

@Component({
  selector: 'app-stats-grid',
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      @for (stat of stats(); track stat.label) {
      <div class="stat-card">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #334155;
      text-align: center;
      transition: all 0.25s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: #8b5cf6;
      box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #a78bfa;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #94a3b8;
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
}
