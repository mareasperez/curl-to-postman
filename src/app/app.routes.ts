import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { ResultsPageComponent } from './pages/results-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'results', component: ResultsPageComponent }
];
