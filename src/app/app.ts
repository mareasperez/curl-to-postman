import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CurlParserService, ParsedRequest } from './services/curl-parser.service';
import { VariableDetectorService, VariableAnalysis } from './services/variable-detector.service';
import { PostmanGeneratorService, PostmanCollection, PostmanEnvironment } from './services/postman-generator.service';

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
  private postmanGenerator = new PostmanGeneratorService();
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

  // Results
  currentCollection = signal<PostmanCollection | null>(null);
  currentEnvironments = signal<PostmanEnvironment[]>([]);
  currentVariables = signal<VariableAnalysis | null>(null);
  currentRequests = signal<ParsedRequest[]>([]);
  editableRequestNames = signal<Map<number, string>>(new Map());
  editableEnvNames = signal<Map<string, string>>(new Map());

  // Computed
  curlCount = computed(() => {
    const count = (this.curlInput().match(/curl\s+/g) || []).length;
    return `${count} command${count !== 1 ? 's' : ''} detected`;
  });

  collectionJson = computed(() => 
    this.currentCollection() ? JSON.stringify(this.currentCollection(), null, 2) : ''
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

      // Generate Postman collection
      const collection = this.postmanGenerator.generate(
        requests, 
        variables, 
        (host) => this.variableDetector.getHostVariable(host),
        this.editableRequestNames()
      );
      const environments = this.postmanGenerator.generateEnvironments(
        variables,
        (host) => this.variableDetector.getHostVariable(host),
        this.editableEnvNames()
      );

      // Update state
      this.currentCollection.set(collection);
      this.currentEnvironments.set(environments);
      this.currentVariables.set(variables);
      this.currentRequests.set(requests);
      this.showOutput.set(true);
      
      this.displayToast('Conversion successful! 🎉', 'success');
      
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
    const text = this.collectionJson();
    navigator.clipboard.writeText(text).then(() => {
      this.displayToast('Copied to clipboard! 📋', 'success');
    }).catch(() => {
      this.displayToast('Copy error', 'error');
    });
  }

  download() {
    const data = {
      collection: this.currentCollection(),
      environments: this.currentEnvironments()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postman-collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

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
    
    // Regenerate collection with new names
    this.regenerateCollection();
  }

  updateEnvironmentName(oldName: string, newName: string) {
    const names = new Map(this.editableEnvNames());
    names.set(oldName, newName);
    this.editableEnvNames.set(names);
    
    // Regenerate environments with new names
    this.regenerateEnvironments();
  }

  private regenerateCollection() {
    const requests = this.currentRequests();
    const variables = this.currentVariables();
    if (requests.length === 0 || !variables) return;

    const collection = this.postmanGenerator.generate(
      requests,
      variables,
      (host) => this.variableDetector.getHostVariable(host),
      this.editableRequestNames()
    );
    this.currentCollection.set(collection);
  }

  private regenerateEnvironments() {
    const variables = this.currentVariables();
    if (!variables) return;

    const environments = this.postmanGenerator.generateEnvironments(
      variables,
      (host) => this.variableDetector.getHostVariable(host),
      this.editableEnvNames()
    );
    this.currentEnvironments.set(environments);
  }

  getSummaryData() {
    const requests = this.currentRequests();
    const variables = this.currentVariables();
    const collection = this.currentCollection();
    
    return {
      totalRequests: requests.length,
      totalHosts: variables?.hosts.size || 0,
      totalTokens: variables?.tokens.size || 0,
      totalEnvironments: variables?.environments.size || 0,
      requests: collection?.item || [],
      environments: Array.from(variables?.environments.values() || [])
    };
  }
}
