import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataVisualizationComponent } from './components/data-visualization/data-visualization.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DataVisualizationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-parallel-workers';
}
