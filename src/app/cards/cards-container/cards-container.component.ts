import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cards-container',
  standalone: true,
  imports: [],
  templateUrl: './cards-container.component.html',
  styleUrl: './cards-container.component.css'
})
export class CardsContainerComponent {
  title = input.required<string>();
}
