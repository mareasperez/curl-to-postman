import { Component } from '@angular/core';
import { OutputSectionComponent } from '../components/output-section/output-section.component';

@Component({
    selector: 'app-results-page',
    imports: [OutputSectionComponent],
    template: `
    <main class="flex flex-col gap-8">
      <app-output-section />
    </main>
  `,
    styles: [`
    .flex {
      display: flex;
    }
    .flex-col {
      flex-direction: column;
    }
    .gap-8 {
      gap: 2rem;
    }
  `]
})
export class ResultsPageComponent { }
