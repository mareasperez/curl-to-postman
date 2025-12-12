import { Component } from '@angular/core';
import { InputSectionComponent } from '../components/input-section/input-section.component';

@Component({
  selector: 'app-home-page',
  imports: [InputSectionComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent { }
