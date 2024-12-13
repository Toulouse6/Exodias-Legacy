import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CardsService } from '../../services/cards.service';
import { Card } from '../cards.model';
import { CardsContainerComponent } from '../cards-container/cards-container.component';
import { CardsComponent } from '../cards.component';

@Component({
  selector: 'app-user-cards',
  standalone: true,
  templateUrl: './user-cards.component.html',
  styleUrls: ['./user-cards.component.css'],
  imports: [CardsComponent, CardsContainerComponent],
})
export class UserCardsComponent implements OnInit {
  isFetching = signal(false);
  error = signal('');

  private cardsService = inject(CardsService);
  private destroyRef = inject(DestroyRef);
  cards = this.cardsService.loadedUserCards;

  ngOnInit() {
    this.isFetching.set(true);

    const fileContent = localStorage.getItem('userCardsData');
    if (!fileContent) {
        this.isFetching.set(false);
        return;
    }

    // Reload user cards
    const subscription = this.cardsService.loadUserCards().subscribe({
        error: (error: Error) => {
            this.error.set(error.message);
        },
        complete: () => {
            this.isFetching.set(false);
        },
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
}


  onRemoveCard(card: Card) {
    const subscription = this.cardsService.removeUserCard(card).subscribe({
      next: () => {
        console.log('Card removed from favorites.');
      },
      error: (error) => {
        console.error(error);
        this.error.set('Failed to remove card from favorites.');
      },
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  
}
