import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-section',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <div class="flex justify-between items-center mb-6 flex-wrap-mobile gap-4">
        <h2 class="text-2xl font-semibold text-gray-100">📥 Input</h2>
        <button (click)="onClear()" class="btn btn-secondary">
          Clear
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <textarea 
          [ngModel]="curlInput()" 
          (ngModelChange)="onCurlInputChange($event)"
          class="textarea" 
          placeholder="Paste your cURL commands here (one or multiple)...

Example:
curl 'https://api.example.com/users' \\
  -H 'Authorization: Bearer eyJhbGc...' \\
  -H 'Content-Type: application/json'

curl 'https://api.example.com/posts' \\
  -H 'Authorization: Bearer eyJhbGc...'"
        ></textarea>
        <p class="text-gray-400 text-sm">{{ curlCount() }}</p>
      </div>
    </section>

    <!-- Process Button -->
    <div class="text-center py-6">
      <button (click)="onProcess()" class="btn btn-primary text-lg px-8 py-3">
        <span class="text-xl">⚡</span>
        Process
      </button>
    </div>
  `,
  styles: [`
    .card {
      background: #1e293b;
      border-radius: 1rem;
      padding: 2rem;
      border: 1px solid #334155;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
      transition: all 0.25s ease;
    }

    .card:hover {
      border-color: #475569;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.6);
    }

    .textarea {
      width: 100%;
      padding: 1rem;
      background: #0f172a;
      border: 2px solid #334155;
      border-radius: 0.5rem;
      color: #f1f5f9;
      font-family: 'Courier New', monospace;
      font-size: 0.95rem;
      transition: all 0.25s ease;
      min-height: 200px;
      max-height: 50vh;
      resize: vertical;
    }

    .textarea:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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

    .flex {
      display: flex;
    }

    .flex-col {
      flex-direction: column;
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

    .text-center {
      text-align: center;
    }

    .text-2xl {
      font-size: 1.5rem;
    }

    .text-lg {
      font-size: 1.125rem;
    }

    .text-xl {
      font-size: 1.25rem;
    }

    .text-sm {
      font-size: 0.875rem;
    }

    .font-semibold {
      font-weight: 600;
    }

    .text-gray-100 {
      color: #f1f5f9;
    }

    .text-gray-400 {
      color: #94a3b8;
    }

    .px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .py-3 {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }

    .py-6 {
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .flex-wrap-mobile {
        flex-wrap: wrap;
      }
    }
  `]
})
export class InputSectionComponent {
  curlInput = input<string>('');
  curlCount = input<string>('');
  curlInputChange = output<string>();
  clearClicked = output<void>();
  processClicked = output<void>();

  onCurlInputChange(value: string) {
    this.curlInputChange.emit(value);
  }

  onClear() {
    this.clearClicked.emit();
  }

  onProcess() {
    this.processClicked.emit();
  }
}
