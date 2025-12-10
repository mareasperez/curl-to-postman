import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportFormat } from '../../../services/providers/export-provider.interface';

@Component({
  selector: 'app-format-selector',
  imports: [CommonModule, FormsModule],
  template: `
    <select 
      [ngModel]="selectedFormatId()" 
      (ngModelChange)="onFormatChange($event)" 
      class="format-selector"
    >
      @for (format of formats(); track format.id) {
      <option [value]="format.id">{{ format.name }} {{ format.version }}</option>
      }
    </select>
  `,
  styles: [`
    .format-selector {
      padding: 0.5rem 1rem;
      background: #0f172a;
      border: 2px solid #334155;
      border-radius: 0.5rem;
      color: #f1f5f9;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      outline: none;
    }

    .format-selector:hover {
      border-color: #8b5cf6;
    }

    .format-selector:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .format-selector option {
      background: #1e293b;
      color: #f1f5f9;
      padding: 0.5rem;
    }
  `]
})
export class FormatSelectorComponent {
  formats = input<ExportFormat[]>([]);
  selectedFormatId = input<string>('');
  formatChanged = output<string>();

  onFormatChange(formatId: string) {
    this.formatChanged.emit(formatId);
  }
}
