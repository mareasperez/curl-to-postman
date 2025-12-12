import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatSelectorComponent } from '../shared/format-selector/format-selector.component';
import { SummaryTabComponent } from '../tabs/summary-tab/summary-tab.component';
import { OutputViewerTabComponent } from '../tabs/output-viewer-tab/output-viewer-tab.component';
import { VariablesTabComponent } from '../tabs/variables-tab/variables-tab.component';
import { AdditionalFilesTabComponent } from '../tabs/additional-files-tab/additional-files-tab.component';
import { ExportFormat } from '../../services/providers/export-provider.interface';
import { VariableAnalysis, ParsedRequest } from '../../models';
import { Variable } from '../../models/variable.model';
import { SummaryData } from '../../models/summary-data.model';

@Component({
  selector: 'app-output-section',
  imports: [
    CommonModule,
    FormatSelectorComponent,
    SummaryTabComponent,
    OutputViewerTabComponent,
    VariablesTabComponent,
    AdditionalFilesTabComponent
  ],
  template: `
    <section class="card animate-fadeIn">
      <div class="flex justify-between items-center mb-6 flex-wrap-mobile gap-4">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-semibold text-gray-100">📤 Output</h2>
          <app-format-selector
            [formats]="availableFormats()"
            [selectedFormatId]="currentFormat().id"
            (formatChanged)="onFormatChange($event)"
          ></app-format-selector>
        </div>
        <div class="flex gap-3 flex-wrap-mobile">
          <button (click)="onCopyToClipboard()" class="btn btn-secondary">
            <span>📋</span>
            Copy JSON
          </button>
          <button (click)="onDownload()" class="btn btn-primary">
            <span>💾</span>
            Download
          </button>
          <button (click)="onNewConversion()" class="btn btn-secondary">
            <span>←</span>
            New Conversion
          </button>
        </div>
      </div>

      <div class="tabs">
        <button (click)="switchTab('summary')" [class.active]="activeTab() === 'summary'" class="tab">
          Summary
        </button>
        <button (click)="switchTab('collection')" [class.active]="activeTab() === 'collection'" class="tab">
          {{ currentFormat().name }}
        </button>
        <button (click)="switchTab('environment')" [class.active]="activeTab() === 'environment'" class="tab">
          Environments
        </button>
        <button (click)="switchTab('variables')" [class.active]="activeTab() === 'variables'" class="tab">
          Detected Variables
        </button>
      </div>

      <!-- Tab Content -->
      @if (activeTab() === 'summary') {
        <app-summary-tab
          [summaryData]="summaryData()"
          [editableRequestNames]="editableRequestNames()"
          [editableEnvNames]="editableEnvNames()"
          (requestNameChanged)="onRequestNameChanged($event)"
          (envNameChanged)="onEnvNameChanged($event)"
        ></app-summary-tab>
      }

      @if (activeTab() === 'collection') {
        <app-output-viewer-tab [content]="outputJson()"></app-output-viewer-tab>
      }

      @if (activeTab() === 'environment') {
        <app-additional-files-tab [files]="additionalFiles()"></app-additional-files-tab>
      }

      @if (activeTab() === 'variables') {
        <app-variables-tab
          [hostVariables]="hostVariables()"
          [tokenVariables]="tokenVariables()"
        ></app-variables-tab>
      }
    </section>
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

    .card {
      background: #1e293b;
      border-radius: 1rem;
      padding: 2rem;
      border: 1px solid #334155;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
    }

    .flex {
      display: flex;
    }

    .items-center {
      align-items: center;
    }

    .justify-between {
      justify-content: space-between;
    }

    .gap-3 {
      gap: 0.75rem;
    }

    .gap-4 {
      gap: 1rem;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .text-2xl {
      font-size: 1.5rem;
    }

    .font-semibold {
      font-weight: 600;
    }

    .text-gray-100 {
      color: #f1f5f9;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: inherit;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px rgba(139, 92, 246, 0.4);
    }

    .btn-secondary {
      background: #334155;
      color: #f1f5f9;
      border: 1px solid #475569;
    }

    .btn-secondary:hover {
      background: #475569;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #334155;
      overflow-x: auto;
    }

    .tab {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      white-space: nowrap;
      font-family: inherit;
    }

    .tab:hover {
      color: #f1f5f9;
    }

    .tab.active {
      color: #a78bfa;
      border-bottom-color: #8b5cf6;
    }

    @media (max-width: 768px) {
      .flex-wrap-mobile {
        flex-wrap: wrap;
      }
    }
  `]
})
export class OutputSectionComponent {
  // Inputs
  output = input<any>(null);
  additionalFiles = input<any[]>([]);
  variables = input<VariableAnalysis | null>(null);
  requests = input<ParsedRequest[]>([]);
  editableRequestNames = input<Map<number, string>>(new Map());
  editableEnvNames = input<Map<string, string>>(new Map());
  currentFormat = input<ExportFormat>({ id: '', name: '', version: '', extension: '', mimeType: '', description: '' });
  availableFormats = input<ExportFormat[]>([]);
  currentTab = input<'collection' | 'environment' | 'variables' | 'summary'>('summary');

  // Outputs
  formatChanged = output<string>();
  requestNameChanged = output<{ index: number; name: string }>();
  envNameChanged = output<{ oldName: string; newName: string }>();
  newConversionClicked = output<void>();
  copyRequested = output<string>();
  downloadRequested = output<{ format: ExportFormat; data: any; additionalFiles: any[] }>();

  // Local state for active tab
  activeTab = signal<'collection' | 'environment' | 'variables' | 'summary'>('summary');

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

    return Array.from(vars.hosts.entries()).map(([host, indices]) => ({
      name: `{{${host.replace(/[^a-zA-Z0-9]/g, '_')}_host}}`,
      value: host,
      count: indices.length
    }));
  };

  tokenVariables = (): Variable[] => {
    const vars = this.variables();
    if (!vars) return [];

    return Array.from(vars.tokens.entries()).map(([key, data]) => ({
      name: key,
      value: data.value.substring(0, 50) + (data.value.length > 50 ? '...' : ''),
      count: data.requests.length
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
}
