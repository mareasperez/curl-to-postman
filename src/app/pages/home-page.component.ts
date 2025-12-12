import { Component } from '@angular/core';
import { InputSectionComponent } from '../components/input-section/input-section.component';

@Component({
    selector: 'app-home-page',
    imports: [InputSectionComponent],
    template: `
    <main class="flex flex-col gap-8">
      <app-input-section />
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
export class HomePageComponent { }
