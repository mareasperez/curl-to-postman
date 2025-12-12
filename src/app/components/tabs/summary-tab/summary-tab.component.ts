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
  templateUrl: './summary-tab.component.html',
  styleUrl: './summary-tab.component.css'
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
  duplicateNames = input<Map<string, number[]>>(new Map());
  editableEnvNames = input<Map<string, string>>(new Map());

  requestNameChanged = output<{ index: number; name: string }>();
  envNameChanged = output<{ oldName: string; newName: string }>();
  requestClicked = output<number>();

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
    const duplicates = this.duplicateNames();

    return this.summaryData().requests.map((request, index) => {
      const name = this.editableRequestNames().get(index) || request.name;
      // Check if this name is in the duplicates map AND if this index is one of the duplicate occurrences
      const isDuplicate = duplicates.has(name) &&
        (duplicates.get(name)?.includes(index) ?? false);

      return {
        badge: {
          text: request.request.method,
          class: request.request.method.toLowerCase()
        },
        name: name,
        preview: request.request.url.raw,
        meta: `Headers (${Object.keys(request.request.headers || {}).length})`,
        isDuplicate: isDuplicate
      };
    });
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

  onRequestClick(index: number) {
    this.requestClicked.emit(index);
  }
}
