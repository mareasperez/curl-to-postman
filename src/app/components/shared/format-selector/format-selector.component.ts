import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportFormat } from '@services/providers/export-provider.interface';

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
  styles: [
    `
      .format-selector {
        height: 2.2rem;
        padding: 0 0.75rem;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 0.62rem;
        color: var(--text);
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.25s ease;
        outline: none;
      }

      .format-selector:hover {
        border-color: var(--border-strong);
      }

      .format-selector:focus {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--focus);
      }

      .format-selector option {
        background: var(--surface-solid);
        color: var(--text);
        padding: 0.5rem;
      }
    `,
  ],
})
export class FormatSelectorComponent {
  formats = input<ExportFormat[]>([]);
  selectedFormatId = input<string>('');
  formatChanged = output<string>();

  onFormatChange(formatId: string) {
    this.formatChanged.emit(formatId);
  }
}
