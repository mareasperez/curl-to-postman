import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsGridComponent } from '../../shared/stats-grid/stats-grid.component';
import { EditableListComponent } from '../../shared/editable-list/editable-list.component';
import { Stat } from '../../../models/stat.model';
import { EditableItem } from '../../../models/editable-item.model';
import { SummaryData } from '../../../models/summary-data.model';

@Component({
  selector: 'app-summary-tab',
  imports: [CommonModule, StatsGridComponent, EditableListComponent],
  template: `
    <div class="animate-fadeIn">
      <div class="summary-container">
        <!-- Statistics -->
        <app-stats-grid [stats]="stats()"></app-stats-grid>

        <!-- Requests List with Editable Names -->
        @if (summaryData().requests.length > 0) {
        <div class="section-card">
          <h4 class="section-title">📋 Requests</h4>
          <app-editable-list 
            [items]="requestItems()" 
            (itemChanged)="onRequestNameChange($event)"
          ></app-editable-list>
        </div>
        }

        <!-- Environments List with Editable Names -->
        @if (summaryData().environments.length > 0) {
        <div class="section-card">
          <h4 class="section-title">🌍 Environments</h4>
          <app-editable-list 
            [items]="environmentItems()" 
            (itemChanged)="onEnvironmentNameChange($event)"
          ></app-editable-list>
        </div>
        }
      </div>
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

    .summary-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section-card {
      background: #0f172a;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #334155;
    }

    .section-title {
      color: #a78bfa;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      margin-top: 0;
      font-weight: 600;
    }
  `]
})
export class SummaryTabComponent {
  summaryData = input<SummaryData>({
    totalRequests: 0,
    totalHosts: 0,
    totalTokens: 0,
    totalEnvironments: 0,
    requests: [],
    environments: []
  });
  editableRequestNames = input<Map<number, string>>(new Map());
  editableEnvNames = input<Map<string, string>>(new Map());

  requestNameChanged = output<{ index: number; name: string }>();
  envNameChanged = output<{ oldName: string; newName: string }>();

  stats = (): Stat[] => {
    const data = this.summaryData();
    return [
      { icon: '📊', value: data.totalRequests, label: 'Requests' },
      { icon: '🌐', value: data.totalHosts, label: 'Hosts' },
      { icon: '🔑', value: data.totalTokens, label: 'Tokens' },
      { icon: '🌍', value: data.totalEnvironments, label: 'Environments' }
    ];
  };

  requestItems = (): EditableItem[] => {
    return this.summaryData().requests.map((request, index) => ({
      badge: {
        text: request.request.method,
        class: request.request.method.toLowerCase()
      },
      name: request.name,
      preview: request.request.url.raw
    }));
  };

  environmentItems = (): EditableItem[] => {
    return this.summaryData().environments.map(env => ({
      badge: {
        text: env.isLocal ? 'Local' : 'Remote',
        class: env.isLocal ? 'local' : 'remote'
      },
      name: this.editableEnvNames().get(env.name) || env.name,
      preview: `${env.protocol}://${env.host}`
    }));
  };

  onRequestNameChange(event: { index: number; value: string }) {
    this.requestNameChanged.emit({ index: event.index, name: event.value });
  }

  onEnvironmentNameChange(event: { index: number; value: string }) {
    const env = this.summaryData().environments[event.index];
    if (env) {
      this.envNameChanged.emit({ oldName: env.name, newName: event.value });
    }
  }
}
