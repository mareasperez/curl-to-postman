import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatSelectorComponent } from '@components/shared/format-selector/format-selector.component';
import { SummaryTabComponent } from '@components/tabs/summary-tab/summary-tab.component';
import { OutputViewerTabComponent } from '@components/tabs/output-viewer-tab/output-viewer-tab.component';
import { VariablesTabComponent } from '@components/tabs/variables-tab/variables-tab.component';
import { AdditionalFilesTabComponent } from '@components/tabs/additional-files-tab/additional-files-tab.component';
import { RequestDetailsEditorComponent } from '@components/shared/request-details-editor/request-details-editor.component';
import { ModalComponent } from '@components/shared/modal/modal.component';
import { ExportFormat } from '@services/providers/export-provider.interface';
import { VariableAnalysis, ParsedRequest } from '@models/index';
import { Variable } from '@models/variable.model';
import { SummaryData } from '@models/summary-data.model';
import { AdditionalFile } from '@models/additional-file.model';

@Component({
  selector: 'app-output-section',
  imports: [
    CommonModule,
    FormatSelectorComponent,
    SummaryTabComponent,
    OutputViewerTabComponent,
    VariablesTabComponent,
    AdditionalFilesTabComponent,
    ModalComponent,
    RequestDetailsEditorComponent
  ],
  templateUrl: './output-section.component.html',
  styleUrl: './output-section.component.css'
})
export class OutputSectionComponent {
  // Inputs
  output = input<unknown>(null);
  additionalFiles = input<AdditionalFile[]>([]);
  variables = input<VariableAnalysis | null>(null);
  requests = input<ParsedRequest[]>([]);
  originalRequests = input<ParsedRequest[]>([]);
  editableRequestNames = input<Map<number, string>>(new Map());
  duplicateNames = input<Map<string, number[]>>(new Map());
  editableEnvNames = input<Map<string, string>>(new Map());
  hasModifiedRequests = input<boolean>(false);
  hostVariableOverrides = input<Map<string, string>>(new Map());
  tokenVariableOverrides = input<Map<string, string>>(new Map());
  removedTokenKeys = input<Set<string>>(new Set());
  currentFormat = input<ExportFormat>({ id: '', name: '', version: '', extension: '', mimeType: '', description: '' });
  availableFormats = input<ExportFormat[]>([]);
  currentTab = input<'collection' | 'environment' | 'variables' | 'summary'>('summary');

  // Outputs
  formatChanged = output<string>();
  requestNameChanged = output<{ index: number; name: string }>();
  envNameChanged = output<{ oldName: string; newName: string }>();
  newConversionClicked = output<void>();
  requestResetRequested = output<{ index: number }>();
  resetAllRequested = output<void>();
  copyRequested = output<string>();
  downloadRequested = output<{ format: ExportFormat; data: unknown; additionalFiles: AdditionalFile[] }>();
  requestDetailsUpdated = output<{ index: number; request: ParsedRequest }>();
  hostVariableUpdated = output<{ name: string; value: string }>();
  tokenVariableUpdated = output<{ name: string; value: string }>();
  tokenSanitized = output<string>();
  tokenCleared = output<string>();
  tokenRemoveToggled = output<{ name: string; removed: boolean }>();

  // Local state for active tab

  // Local state for active tab
  activeTab = signal<'collection' | 'environment' | 'variables' | 'summary'>('summary');

  // Modal State
  // Modal State
  // Modal State
  selectedRequestIndex = signal<number>(-1);
  isDetailsModalOpen = signal(false);

  selectedRequest = computed(() => {
    const index = this.selectedRequestIndex();
    const reqs = this.requests();
    if (index >= 0 && index < reqs.length) {
      return reqs[index];
    }
    return null;
  });

  selectedOriginalRequest = computed(() => {
    const index = this.selectedRequestIndex();
    const originals = this.originalRequests();
    if (index >= 0 && originals && index < originals.length) {
      return originals[index];
    }
    return null;
  });

  selectedRequestName = computed(() => {
    const index = this.selectedRequestIndex();
    const req = this.selectedRequest();
    if (!req) return '';
    return this.editableRequestNames().get(index) || `${req.method} ${req.url}`;
  });

  selectedRawOutput = computed(() => {
    const index = this.selectedRequestIndex();
    const out = this.output() as { item?: unknown[] };
    if (out && Array.isArray(out.item) && out.item[index]) {
      return out.item[index];
    }
    return null;
  });

  // Computed
  outputJson = (): string => {
    return this.output() ? JSON.stringify(this.output(), null, 2) : '';
  };

  summaryData = (): SummaryData => {
    const vars = this.variables();
    const reqs = this.requests();

    return {
      totalRequests: reqs.length,
      totalHosts: vars ? vars.hosts.size : 0,
      totalTokens: vars ? vars.tokens.size : 0,
      totalEnvironments: vars ? vars.environments.size : 0,
      requests: reqs.map((req, index) => ({
        name: this.editableRequestNames().get(index) || `${req.method} ${req.url}`,
        request: req
      })),
      environments: vars ? Array.from(vars.environments.values()) : []
    };
  };

  hostVariables = (): Variable[] => {
    const vars = this.variables();
    if (!vars) return [];
    return Array.from(vars.hosts.entries()).map(([host, indices]) => {
      const varName = vars.hostVariableNames.get(host) ?? 'host__default';
      return {
        name: varName,
        value: this.hostVariableOverrides().get(varName) ?? host,
        count: indices.length
      };
    });
  };

  tokenVariables = (): Variable[] => {
    const vars = this.variables();
    if (!vars) return [];

    return Array.from(vars.tokens.entries()).map(([key, data]) => ({
      name: key,
      value: this.tokenVariableOverrides().get(key) ?? data.value,
      count: data.requests.length,
      removed: this.removedTokenKeys().has(key)
    }));
  };

  switchTab(tab: 'collection' | 'environment' | 'variables' | 'summary') {
    this.activeTab.set(tab);
  }

  onFormatChange(formatId: string) {
    this.formatChanged.emit(formatId);
  }

  onRequestNameChanged(event: { index: number; name: string }) {
    this.requestNameChanged.emit(event);
  }

  onEnvNameChanged(event: { oldName: string; newName: string }) {
    this.envNameChanged.emit(event);
  }

  onNewConversion() {
    this.newConversionClicked.emit();
  }

  onCopyToClipboard() {
    this.copyRequested.emit(this.outputJson());
  }

  onDownload() {
    this.downloadRequested.emit({
      format: this.currentFormat(),
      data: this.output(),
      additionalFiles: this.additionalFiles()
    });
  }

  onRequestClick(index: number) {
    const req = this.requests()[index];
    if (req) {
      this.selectedRequestIndex.set(index);
      this.isDetailsModalOpen.set(true);
    }
  }

  onSummaryStatClick(label: string) {
    if (label === 'Hosts' || label === 'Tokens') {
      this.switchTab('variables');
      return;
    }
    if (label === 'Environments') {
      this.switchTab('environment');
    }
  }

  onHostVariableUpdated(event: { name: string; value: string }) {
    this.hostVariableUpdated.emit(event);
  }

  onTokenVariableUpdated(event: { name: string; value: string }) {
    this.tokenVariableUpdated.emit(event);
  }

  onTokenSanitized(name: string) {
    this.tokenSanitized.emit(name);
  }

  onTokenCleared(name: string) {
    this.tokenCleared.emit(name);
  }

  onTokenRemoveToggled(event: { name: string; removed: boolean }) {
    this.tokenRemoveToggled.emit(event);
  }

  closeDetailsModal() {
    this.isDetailsModalOpen.set(false);
  }

  onModalRequestUpdated(updatedReq: ParsedRequest) {
    if (this.selectedRequestIndex() !== -1) {
      this.requestDetailsUpdated.emit({
        index: this.selectedRequestIndex(),
        request: updatedReq
      });
    }
  }

  onModalResetRequested() {
    if (this.selectedRequestIndex() !== -1) {
      this.requestResetRequested.emit({
        index: this.selectedRequestIndex()
      });
    }
  }

  onResetAll() {
    console.log('[OutputSection] Reset All clicked');
    console.log('[OutputSection] hasModifiedRequests:', this.hasModifiedRequests());
    console.log('[OutputSection] Emitting resetAllRequested');
    this.resetAllRequested.emit();
  }
}
