import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from './cards.model';

@Component({
    selector: 'app-cards',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cards.component.html',
    styleUrls: ['./cards.component.css'],
})
export class CardsComponent {
    @Input() cards!: Card[];
    @Output() selectCard = new EventEmitter<Card>();
    @Input() isUserCards: boolean = false;

    onSelectCard(card: Card) {
        this.selectCard.emit(card);
    }
}
