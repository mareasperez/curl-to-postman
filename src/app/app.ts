import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CurlParserService, ParsedRequest } from './services/curl-parser.service';
import { VariableDetectorService, VariableAnalysis } from './services/variable-detector.service';
import { ExportProviderService } from './services/providers/export-provider.service';
import { ExportFormat } from './services/providers/export-provider.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Services
  private curlParser = new CurlParserService();
  private variableDetector = new VariableDetectorService();
  private exportProvider = inject(ExportProviderService);
  private router = new Router();

  // Route detection
  isResultsView = signal(false);

  constructor() {
    // Detect route changes
    this.updateRouteState();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateRouteState();
    });
  }

  private updateRouteState() {
    this.isResultsView.set(this.router.url.includes('/results'));
  }

  // State
  curlInput = signal('');
  currentTab = signal<'collection' | 'environment' | 'variables' | 'summary'>('summary');
  showOutput = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);
  showFeaturesModal = signal(false);
  selectedFormatId = signal('postman');

  // Results
  currentOutput = signal<any>(null);
  currentAdditionalFiles = signal<any[]>([]);
  currentVariables = signal<VariableAnalysis | null>(null);
  currentRequests = signal<ParsedRequest[]>([]);
  editableRequestNames = signal<Map<number, string>>(new Map());
  editableEnvNames = signal<Map<string, string>>(new Map());

  // Computed
  availableFormats = computed(() => this.exportProvider.getAvailableFormats());

  currentFormat = computed(() =>
    this.availableFormats().find(f => f.id === this.selectedFormatId())
  );

  // Computed
  curlCount = computed(() => {
    const count = (this.curlInput().match(/curl\s+/g) || []).length;
    return `${count} command${count !== 1 ? 's' : ''} detected`;
  });

  outputJson = computed(() =>
    this.currentOutput() ? JSON.stringify(this.currentOutput(), null, 2) : ''
  );

  convert() {
    const input = this.curlInput().trim();

    if (!input) {
      this.displayToast('Please enter at least one cURL command', 'error');
      return;
    }

    try {
      // Parse cURL commands
      const requests = this.curlParser.parseMultiple(input);

      if (requests.length === 0) {
        this.displayToast('No valid cURL commands detected', 'error');
        return;
      }

      // Detect variables
      const variables = this.variableDetector.analyze(requests);

      // Export using selected format
      const result = this.exportProvider.export(this.selectedFormatId(), {
        requests,
        variables,
        getHostVariable: (host) => this.variableDetector.getHostVariable(host),
        customRequestNames: this.editableRequestNames(),
        customEnvNames: this.editableEnvNames()
      });

      if (!result) {
        this.displayToast('Export failed: format not found', 'error');
        return;
      }

      // Update state
      this.currentOutput.set(result.data);
      this.currentAdditionalFiles.set(result.additionalFiles || []);
      this.currentVariables.set(variables);
      this.currentRequests.set(requests);
      this.showOutput.set(true);

      const format = this.currentFormat();
      this.displayToast(`Exported as ${format?.name || 'Unknown'} 🎉`, 'success');

      // Navigate to results view
      this.router.navigate(['/results']);
    } catch (error) {
      console.error('Conversion error:', error);
      this.displayToast('Conversion error: ' + (error as Error).message, 'error');
    }
  }

  clear() {
    this.curlInput.set('');
    this.showOutput.set(false);
    this.displayToast('Field cleared', 'success');
  }

  switchTab(tab: 'collection' | 'environment' | 'variables' | 'summary') {
    this.currentTab.set(tab);
  }

  toggleFeaturesModal() {
    this.showFeaturesModal.set(!this.showFeaturesModal());
  }

  newConversion() {
    this.router.navigate(['/']);
  }

  copyToClipboard() {
    const text = this.outputJson();
    navigator.clipboard.writeText(text).then(() => {
      this.displayToast('Copied to clipboard! 📋', 'success');
    }).catch(() => {
      this.displayToast('Copy error', 'error');
    });
  }

  download() {
    const format = this.currentFormat();
    if (!format) return;

    const data = this.currentOutput();
    const additionalFiles = this.currentAdditionalFiles();

    // Download main file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: format.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${format.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Download additional files (e.g., environments)
    additionalFiles.forEach(file => {
      const fileBlob = new Blob([JSON.stringify(file.data, null, 2)], { type: file.mimeType });
      const fileUrl = URL.createObjectURL(fileBlob);
      const fileLink = document.createElement('a');
      fileLink.href = fileUrl;
      fileLink.download = file.name;
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
      URL.revokeObjectURL(fileUrl);
    });

    this.displayToast('Download started! 💾', 'success');
  }

  private displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  getHostVariablesList() {
    const vars = this.currentVariables();
    if (!vars) return [];

    return Array.from(vars.hosts.entries()).map(([host, indices]) => ({
      name: this.variableDetector.getHostVariable(host),
      value: host,
      count: indices.length
    }));
  }

  getTokenVariablesList() {
    const vars = this.currentVariables();
    if (!vars) return [];

    return Array.from(vars.tokens.entries()).map(([key, data]) => ({
      name: key,
      value: data.value.substring(0, 50) + (data.value.length > 50 ? '...' : ''),
      count: data.requests.length
    }));
  }

  updateRequestName(index: number, newName: string) {
    const names = new Map(this.editableRequestNames());
    names.set(index, newName);
    this.editableRequestNames.set(names);

    // Regenerate output with new names
    this.regenerateOutput();
  }

  updateEnvironmentName(oldName: string, newName: string) {
    const names = new Map(this.editableEnvNames());
    names.set(oldName, newName);
    this.editableEnvNames.set(names);

    // Regenerate output with new names
    this.regenerateOutput();
  }

  private regenerateOutput() {
    const requests = this.currentRequests();
    const variables = this.currentVariables();
    if (requests.length === 0 || !variables) return;

    const result = this.exportProvider.export(this.selectedFormatId(), {
      requests,
      variables,
      getHostVariable: (host) => this.variableDetector.getHostVariable(host),
      customRequestNames: this.editableRequestNames(),
      customEnvNames: this.editableEnvNames()
    });

    if (result) {
      this.currentOutput.set(result.data);
      this.currentAdditionalFiles.set(result.additionalFiles || []);
    }
  }

  getSummaryData() {
    const requests = this.currentRequests();
    const variables = this.currentVariables();
    const output = this.currentOutput();

    return {
      totalRequests: requests.length,
      totalHosts: variables?.hosts.size || 0,
      totalTokens: variables?.tokens.size || 0,
      totalEnvironments: variables?.environments.size || 0,
      requests: output?.item || output?.paths || [],
      environments: Array.from(variables?.environments.values() || [])
    };
  }

  selectFormat(formatId: string) {
    this.selectedFormatId.set(formatId);
    // Regenerate with new format if we have data
    if (this.currentRequests().length > 0) {
      this.regenerateOutput();
    }
  }
}
