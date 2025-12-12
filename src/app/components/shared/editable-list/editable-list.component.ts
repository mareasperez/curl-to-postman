import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableItem } from '../../../models/editable-item.model';

// Re-export for backwards compatibility
export type { EditableItem } from '../../../models/editable-item.model';

@Component({
  selector: 'app-editable-list',
  imports: [CommonModule],
  templateUrl: './editable-list.component.html',
  styleUrl: './editable-list.component.css'
})
export class EditableListComponent {
  items = input<EditableItem[]>([]);
  itemChanged = output<{ index: number; value: string }>();

  onItemChange(index: number, value: string) {
    this.itemChanged.emit({ index, value });
  }
}
