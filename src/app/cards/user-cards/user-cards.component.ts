import { Component, OnInit, signal } from '@angular/core';
import { CardsService } from '../../services/cards.service';
import { Card } from '../cards.model';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-user-cards',
    standalone: true,
    templateUrl: './user-cards.component.html',
    styleUrls: ['./user-cards.component.css'],
    imports: [CommonModule],
})
export class UserCardsComponent implements OnInit {

    isFetching = signal(false);
    availableCardsFetching = signal(false);


    error = signal('');
    userCards = this.cardsService.loadedUserCards;

    constructor(public cardsService: CardsService) { }

    ngOnInit() {
        this.isFetching.set(true);
        this.cardsService.loadUserCards().subscribe({
            error: (err: any) => {
                this.error.set(err.message);
                console.error('Error loading user cards:', err);
            },
            complete: () => this.isFetching.set(false),
        });
    }

    onRemoveCard(card: Card) {
        this.cardsService.removeUserCard(card).pipe(
            tap(() => console.log(`Card "${card.title}" removed successfully.`))
        ).subscribe({
            error: (err: any) => {
                console.error('Error removing card:', err);
                this.error.set('Failed to remove the card.');
            },
        });
    }

    trackById(index: number, card: Card): string {
        return card.id;
    }
}
