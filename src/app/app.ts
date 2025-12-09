import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // State
  curlInput = signal('');
  currentTab = signal<'collection' | 'environment' | 'variables'>('collection');
  showOutput = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);

  // Results
  currentCollection = signal<PostmanCollection | null>(null);
  currentEnvironments = signal<PostmanEnvironment[]>([]);
  currentVariables = signal<VariableAnalysis | null>(null);
  currentRequests = signal<ParsedRequest[]>([]);

  // Computed
  curlCount = computed(() => {
    const count = (this.curlInput().match(/curl\s+/g) || []).length;
    return `${count} comando${count !== 1 ? 's' : ''} detectado${count !== 1 ? 's' : ''}`;
  });

  collectionJson = computed(() => 
    this.currentCollection() ? JSON.stringify(this.currentCollection(), null, 2) : ''
  );

  convert() {
    const input = this.curlInput().trim();
    
    if (!input) {
      this.displayToast('Por favor ingresa al menos un comando cURL', 'error');
      return;
    }

    try {
      // Parse cURL commands
      const requests = this.curlParser.parseMultiple(input);
      
      if (requests.length === 0) {
        this.displayToast('No se detectaron comandos cURL válidos', 'error');
        return;
      }

      // Detect variables
      const variables = this.variableDetector.analyze(requests);

      // Generate Postman collection
      const collection = this.postmanGenerator.generate(
        requests, 
        variables, 
        (host) => this.variableDetector.getHostVariable(host)
      );
      const environments = this.postmanGenerator.generateEnvironments(
        variables,
        (host) => this.variableDetector.getHostVariable(host)
      );

      // Update state
      this.currentCollection.set(collection);
      this.currentEnvironments.set(environments);
      this.currentVariables.set(variables);
      this.currentRequests.set(requests);
      this.showOutput.set(true);
      
      this.displayToast('¡Conversión exitosa! 🎉', 'success');
    } catch (error) {
      console.error('Conversion error:', error);
      this.displayToast('Error al convertir: ' + (error as Error).message, 'error');
    }
  }

  clear() {
    this.curlInput.set('');
    this.showOutput.set(false);
    this.displayToast('Campo limpiado', 'success');
  }

  switchTab(tab: 'collection' | 'environment' | 'variables') {
    this.currentTab.set(tab);
  }

  copyToClipboard() {
    const text = this.collectionJson();
    navigator.clipboard.writeText(text).then(() => {
      this.displayToast('¡Copiado al portapapeles! 📋', 'success');
    }).catch(() => {
      this.displayToast('Error al copiar', 'error');
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

    this.displayToast('¡Descarga iniciada! 💾', 'success');
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
}
