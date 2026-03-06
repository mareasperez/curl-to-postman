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
  hostVariableOverrides = new Map<string, string>();
  tokenVariableOverrides = new Map<string, string>();
  removedTokenKeys = new Set<string>();

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
    console.log('[ResultsPage] onResetAllRequested called');
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
    this.downloadJsonFile(`curl-export.${event.format.extension}`, event.data);

    // Download additional files too (e.g., Postman environments)
    event.additionalFiles.forEach(file => {
      this.downloadJsonFile(file.name, file.data);
    });
  }

  onHostVariableUpdated(event: { name: string; value: string }) {
    const next = new Map(this.hostVariableOverrides);
    next.set(event.name, event.value);
    this.hostVariableOverrides = next;
    this.regenerate();
  }

  onTokenVariableUpdated(event: { name: string; value: string }) {
    const next = new Map(this.tokenVariableOverrides);
    next.set(event.name, event.value);
    this.tokenVariableOverrides = next;

    // If user edits value manually, ensure token is considered active
    const removed = new Set(this.removedTokenKeys);
    removed.delete(event.name);
    this.removedTokenKeys = removed;
    this.regenerate();
  }

  onTokenSanitized(name: string) {
    const next = new Map(this.tokenVariableOverrides);
    next.set(name, '[REDACTED]');
    this.tokenVariableOverrides = next;

    const removed = new Set(this.removedTokenKeys);
    removed.delete(name);
    this.removedTokenKeys = removed;
    this.regenerate();
  }

  onTokenCleared(name: string) {
    const next = new Map(this.tokenVariableOverrides);
    next.set(name, '');
    this.tokenVariableOverrides = next;

    const removed = new Set(this.removedTokenKeys);
    removed.delete(name);
    this.removedTokenKeys = removed;
    this.regenerate();
  }

  onTokenRemoveToggled(event: { name: string; removed: boolean }) {
    const removed = new Set(this.removedTokenKeys);
    if (event.removed) {
      removed.add(event.name);
    } else {
      removed.delete(event.name);
    }
    this.removedTokenKeys = removed;
    this.regenerate();
  }

  private reconvert() {
    this.regenerate();
  }

  private downloadJsonFile(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
        customEnvNames: envNames,
        customHostVariables: this.hostVariableOverrides,
        customTokenVariables: this.tokenVariableOverrides,
        removedTokenKeys: this.removedTokenKeys
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
      this.appState.editableState().envNames,
      this.hostVariableOverrides,
      this.tokenVariableOverrides,
      this.removedTokenKeys
    );

    if (result.success) {
      this.appState.setConversionResult(result);
    }
  }
}
