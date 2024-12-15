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
    @Input() cards: Card[] = [];  
    @Input() isUserCards: boolean = false;  
    @Output() selectCard = new EventEmitter<Card>(); 
    @Output() unselectCard = new EventEmitter<Card>();  

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
