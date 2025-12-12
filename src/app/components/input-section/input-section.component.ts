import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { ConversionService } from '../../services/conversion.service';

/**
 * Input section component - handles cURL input and processing
 * Uses AppStateService for state management
 */
@Component({
  selector: 'app-input-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-section.component.html',
  styleUrl: './input-section.component.css'
})
export class InputSectionComponent {
  private appState = inject(AppStateService);
  private conversionService = inject(ConversionService);
  private router = inject(Router);

  // Read from state
  curlInput = this.appState.curlInput;

  // Computed curl count
  curlCount = computed(() => {
    const count = this.conversionService.countCommands(this.curlInput());
    return `${count} command${count !== 1 ? 's' : ''} detected`;
  });

  onCurlInputChange(value: string): void {
    this.appState.setCurlInput(value);
  }

  onClear(): void {
    this.appState.clearInput();
  }

  onProcess(): void {
    const result = this.conversionService.convert({
      input: this.curlInput(),
      formatId: this.appState.uiState().selectedFormatId,
      customRequestNames: this.appState.editableState().requestNames,
      customEnvNames: this.appState.editableState().envNames
    });

    if (!result.success) {
      // TODO: Show error toast
      console.error('Conversion failed:', result.error);
      return;
    }

    // Update state with conversion results
    this.appState.setConversionResult({
      output: result.data,
      additionalFiles: result.additionalFiles || [],
      variables: result.variables || null,
      requests: result.requests || [],
      generatedNames: result.generatedNames || new Map(),
      duplicateNames: result.duplicateNames || new Map()
    }, true);

    // Initialize editable names if empty
    if (this.appState.editableState().requestNames.size === 0 && result.generatedNames) {
      this.appState.initializeRequestNames(result.generatedNames);
    }

    this.appState.setShowOutput(true);
    this.appState.setCurrentTab('summary');
    this.router.navigate(['/results']);
  }
}
