import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OutputSectionComponent } from '../components/output-section/output-section.component';
import { AppStateService } from '../services/app-state.service';
import { ExportProviderService } from '../services/providers/export-provider.service';
import { ConversionService } from '../services/conversion.service';
import { ExportFormat } from '../services/providers/export-provider.interface';
import { AdditionalFile } from '../models/additional-file.model';
import { ParsedRequest } from '../models';

@Component({
  selector: 'app-results-page',
  imports: [CommonModule, OutputSectionComponent],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.css'
})
export class ResultsPageComponent {
  public appState = inject(AppStateService);
  private exportProvider = inject(ExportProviderService);
  private conversionService = inject(ConversionService);
  private router = inject(Router);

  availableFormats = this.exportProvider.getAvailableFormats();

  currentFormat = computed(() => {
    const formatId = this.appState.uiState().selectedFormatId;
    return this.exportProvider.getFormatMetadata(formatId) || this.availableFormats[0];
  });

  onFormatChanged(formatId: string) {
    this.appState.setSelectedFormat(formatId);
    this.regenerate();
  }

  onRequestNameChanged(event: { index: number; name: string }) {
    this.appState.setRequestName(event.index, event.name);
    // Debounce reconversion or reconvert specific part? 
    // Ideally we re-run export, but keep parsed requests.
    this.reconvert();
  }

  onEnvNameChanged(event: { oldName: string; newName: string }) {
    this.appState.setEnvName(event.oldName, event.newName);
    this.regenerate();
  }

  onRequestDetailsUpdated(event: { index: number; request: ParsedRequest }) {
    this.appState.updateRequest(event.index, event.request);
    this.regenerate();
  }

  onRequestResetRequested(event: { index: number }) {
    this.appState.resetRequest(event.index);
    this.regenerate();
  }

  onResetAllRequested() {
    this.appState.resetAllRequests();
    this.regenerate();
  }

  onNewConversion() {
    this.appState.clearInput();
    this.router.navigate(['/']);
  }

  onCopy(content: string) {
    navigator.clipboard.writeText(content);
    // Could show toast here
  }

  onDownload(event: { format: ExportFormat; data: unknown; additionalFiles: AdditionalFile[] }) {
    // Implement download logic or delegate to a service
    console.log('Download requested', event);
    // Simple implementation
    const blob = new Blob([JSON.stringify(event.data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curl-export.${event.format.extension}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private reconvert() {
    this.regenerate();
  }

  private regenerate() {
    const currentState = this.appState.conversionState();
    const formatId = this.appState.uiState().selectedFormatId;

    // Check if we have requests to regenerate
    if (!currentState.requests || currentState.requests.length === 0) {
      // Fallback to original parsing if no requests (shouldn't happen on results page)
      const input = this.appState.curlInput();
      const requestNames = this.appState.editableState().requestNames;
      const envNames = this.appState.editableState().envNames;

      const result = this.conversionService.convert({
        input,
        formatId,
        customRequestNames: requestNames,
        customEnvNames: envNames
      });
      if (result.success) {
        this.appState.setConversionResult(result);
      }
      return;
    }

    const result = this.conversionService.regenerate(
      currentState.requests,
      formatId,
      this.appState.editableState().requestNames,
      this.appState.editableState().envNames
    );

    if (result.success) {
      this.appState.setConversionResult(result);
    }
  }
}
