import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CardsService } from '../../services/cards.service';
import { Card } from '../cards.model';
import { CardsComponent } from '../cards.component';
import { CardsContainerComponent } from '../cards-container/cards-container.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-available-cards',
    standalone: true,
    templateUrl: './available-cards.component.html',
    styleUrls: ['./available-cards.component.css'],
    imports: [CardsComponent, CardsContainerComponent, CommonModule],
})
export class AvailableCardsComponent implements OnInit {

    isFetching = signal(false);
    error = signal('');
    selectedOrder: string[] = []; // Track the order of selected cards
    targetOrder: string[] = [
        'EX Legendary 1/5',
        'EX Legendary 2/5',
        'EX Legendary 3/5',
        'EX Legendary 4/5',
        'EX Legendary 5/5',
    ];

    private cardsService = inject(CardsService);
    private destroyRef = inject(DestroyRef);

    cards = this.cardsService.loadedAvailableCards;

    ngOnInit() {
        this.isFetching.set(true);

        // Call reset
        const resetSubscription = this.cardsService.resetCardsCompletely().subscribe({
            next: () => {
                const subscription = this.cardsService.loadAvailableCards().subscribe({
                    error: (error: Error) => {
                        this.error.set(error.message);
                    },
                    complete: () => {
                        this.isFetching.set(false);
                    },
                });

                this.destroyRef.onDestroy(() => subscription.unsubscribe());
            },
            error: (error) => {
                this.error.set(error.message);
                this.isFetching.set(false);
            }
        });

        this.destroyRef.onDestroy(() => resetSubscription.unsubscribe());

        this.resetSelection();
    }

    onSelectCard(selectedCard: Card) {
        const subscription = this.cardsService.addCardToUserCards(selectedCard).subscribe({
            next: () => {
                console.log('Card was selected:', selectedCard.title);
                this.checkCardOrder();
            },
            error: (error) => console.error('Error selecting card:', error),
        });

        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }


    checkCardOrder() {

        const currentUserCards = this.cardsService.loadedUserCards();
        const currentOrder = currentUserCards.map(card => card.title);

        console.log('Current Order:', currentOrder);
        console.log('Target Order:', this.targetOrder);

        if (currentOrder.length === this.targetOrder.length) {
            const isCorrectOrder = currentOrder.every((title, index) => title === this.targetOrder[index]);

            if (isCorrectOrder) {
                // Trigger Animations
                document.getElementById('exodia-header')?.classList.add('exodia-glow');
                document.getElementById('explosion')?.classList.add('explosion');
                document.getElementById('cards-section')?.classList.add('fade-out');

                setTimeout(() => {

                    // Exodia Summoned
                    console.log('Exodia Summoned!');
                    this.resetSelection();
                    // Cleanup animations
                    document.body.classList.remove('shake');
                }, 2000); // Wait for animations to complete
            } else {
                this.cardsService.resetCards();
                this.resetSelection();
                alert('You have failed!');
            }
        }
    }

    resetSelection() {
        this.selectedOrder = [];
        this.selectedOrder.length = 0;
    }

}
