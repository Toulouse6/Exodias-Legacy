import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CardsService } from '../../services/cards.service';
import { Card } from '../cards.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-available-cards',
    standalone: true,
    templateUrl: './available-cards.component.html',
    styleUrls: ['./available-cards.component.css'],
    imports: [CommonModule],
})
export class AvailableCardsComponent implements OnInit {
    isFetching = signal(false);
    error = signal('');
    availableCardsFetching = signal(false);

    availableCards = this.cardsService.loadedAvailableCards;

    private destroyRef = inject(DestroyRef);

    constructor(public cardsService: CardsService) {}

    ngOnInit() {
        this.availableCardsFetching.set(true);

        const subscription = this.cardsService.loadAvailableCards().subscribe({
            error: (err: any) => this.error.set(err.message),
            complete: () => this.availableCardsFetching.set(false),
        });

        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    onSelectCard(card: Card) {
        const subscription = this.cardsService.addCardToUserCards(card)?.subscribe({
            error: (err: any) => console.error('Error adding card:', err),
        });

        if (subscription) {
            this.destroyRef.onDestroy(() => subscription.unsubscribe());
        }
    }

    trackById(index: number, card: Card): string {
        return card.id;
    }
}
