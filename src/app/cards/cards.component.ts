import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../cards/cards.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cards',
    standalone: true,
    templateUrl: './cards.component.html',
    styleUrls: ['./cards.component.css'],
    imports: [CommonModule]
})
export class CardsComponent {
    @Input() cards: Card[] = []; // Cards list
    @Input() isUserCards: boolean = false; // Flag to differentiate card type
    @Output() selectCard = new EventEmitter<Card>(); // Event for selecting cards
    @Output() unselectCard = new EventEmitter<Card>(); // Event for unselecting cards

    trackById(index: number, card: Card): string {
        return card.id;
    }

    onSelectCard(card: Card) {
        this.selectCard.emit(card);
    }

    onRemoveCard(card: Card) {
        this.unselectCard.emit(card);
    }
}
