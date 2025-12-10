import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConversionService } from './services/conversion.service';
import { ExportProviderService } from './services/providers/export-provider.service';
import { ExportFormat } from './services/providers/export-provider.interface';
import { VariableAnalysis } from './services/variable-detector.service';
import { ParsedRequest } from './services/curl-parser.service';

// Import components
import { HeaderComponent } from './components/header/header.component';
import { InputSectionComponent } from './components/input-section/input-section.component';
import { OutputSectionComponent } from './components/output-section/output-section.component';
import { ModalComponent } from './components/shared/modal/modal.component';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    HeaderComponent,
    InputSectionComponent,
    OutputSectionComponent,
    ModalComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Services
  private conversionService = inject(ConversionService);
  private exportProvider = inject(ExportProviderService);
  private router = inject(Router);

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
    this.availableFormats().find(f => f.id === this.selectedFormatId()) || this.availableFormats()[0]
  );

  curlCount = computed(() => {
    const count = this.conversionService.countCommands(this.curlInput());
    return `${count} command${count !== 1 ? 's' : ''} detected`;
  });

  // Event Handlers
  onConvert() {
    const result = this.conversionService.convert({
      input: this.curlInput(),
      formatId: this.selectedFormatId(),
      customRequestNames: this.editableRequestNames(),
      customEnvNames: this.editableEnvNames()
    });

    if (!result.success) {
      this.displayToast(result.error || 'Conversion failed', 'error');
      return;
    }

    // Update state
    this.currentOutput.set(result.data);
    this.currentAdditionalFiles.set(result.additionalFiles || []);
    this.currentVariables.set(result.variables || null);
    this.currentRequests.set(result.requests || []);
    this.showOutput.set(true);

    const format = this.currentFormat();
    this.displayToast(`Exported as ${format?.name || 'Unknown'} 🎉`, 'success');

    // Navigate to results view
    this.router.navigate(['/results']);
  }

  onClear() {
    this.curlInput.set('');
    this.showOutput.set(false);
    this.displayToast('Field cleared', 'success');
  }

  onFormatChanged(formatId: string) {
    this.selectedFormatId.set(formatId);
    // Regenerate output with new format
    if (this.showOutput()) {
      this.onConvert();
    }
  }

  onRequestNameChanged(event: { index: number; name: string }) {
    const names = new Map(this.editableRequestNames());
    names.set(event.index, event.name);
    this.editableRequestNames.set(names);
    // Regenerate output
    this.onConvert();
  }

  onEnvNameChanged(event: { oldName: string; newName: string }) {
    const names = new Map(this.editableEnvNames());
    names.set(event.oldName, event.newName);
    this.editableEnvNames.set(names);
    // Regenerate output
    this.onConvert();
  }

  onNewConversion() {
    this.router.navigate(['/']);
  }

  onCopyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.displayToast('Copied to clipboard! 📋', 'success');
    }).catch(() => {
      this.displayToast('Copy error', 'error');
    });
  }

  onDownload(event: { format: ExportFormat; data: any; additionalFiles: any[] }) {
    const { format, data, additionalFiles } = event;

    // For Postman format, create a single file with collection and environments
    if (format.id === 'postman' && additionalFiles.length > 0) {
      const combinedExport = {
        collection: data,
        environments: additionalFiles.map(file => file.data)
      };

      const blob = new Blob([JSON.stringify(combinedExport, null, 2)], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `postman-export.${format.extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.displayToast('Download started! 💾 (Collection + Environments)', 'success');
    } else {
      // For other formats, download just the main file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${format.name.toLowerCase().replace(/\s+/g, '-')}.${format.extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.displayToast('Download started! 💾', 'success');
    }
  }

  toggleFeaturesModal() {
    this.showFeaturesModal.set(!this.showFeaturesModal());
  }

  private displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }
}
