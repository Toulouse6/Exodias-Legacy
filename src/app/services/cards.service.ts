import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Card } from '../cards/cards.model';

@Injectable({
    providedIn: 'root',
})
export class CardsService {
    private errorService = inject(ErrorService);
    private userCards = signal<Card[]>([]);
    private availableCards = signal<Card[]>([]);
    private httpClient = inject(HttpClient);

    loadedUserCards = this.userCards.asReadonly();
    loadedAvailableCards = this.availableCards.asReadonly();

    constructor() {

        // Load initial state from local storage
        const savedAvailableCards = localStorage.getItem('availableCardsData');
        const savedUserCards = localStorage.getItem('userCardsData');

        if (savedAvailableCards) {
            this.availableCards.set(JSON.parse(savedAvailableCards));
        }

        if (savedUserCards) {
            this.userCards.set(JSON.parse(savedUserCards));
        }

        const resetRequired = localStorage.getItem('appResetRequired');
        if (resetRequired === 'true') {
            this.performAutoReset();
            localStorage.removeItem('appResetRequired');
        }
    }

    private performAutoReset() {
        this.resetCardsCompletely().subscribe({
            error: (error) => {
                console.error('Auto reset failed', error);
            }
        });
    }

    loadAvailableCards() {
        return this.fetchCards('http://localhost:3000/exodia-parts', 'Error fetching available cards.').pipe(
            tap((cards) => {

                const userCardsIds = new Set(this.userCards().map((c) => c.id));
                const filteredCards = cards.filter((card) => !userCardsIds.has(card.id));
                this.availableCards.set(filteredCards);
            })
        );
    }

    loadUserCards() {
        return this.fetchCards('http://localhost:3000/user-cards', 'Error fetching favorite cards.').pipe(
            tap((userCards) => {
                this.userCards.set(userCards);

                // Recompute available cards
                const userCardsIds = new Set(userCards.map((c) => c.id));
                this.availableCards.set(
                    this.availableCards().filter((card) => !userCardsIds.has(card.id))
                );
            })
        );
    }

    addCardToUserCards(card: Card) {
        const prevUserCards = this.userCards();
        const prevAvailableCards = this.availableCards();

        if (!prevUserCards.some((c) => c.id === card.id)) {
            this.userCards.set([...prevUserCards, card]);
            this.availableCards.set(prevAvailableCards.filter((c) => c.id !== card.id));
        }

        return this.httpClient.put('http://localhost:3000/user-cards', { cardId: card.id }).pipe(
            tap(() => {
                console.log('User Cards Updated:', this.userCards().map((c) => c.title));
                localStorage.setItem('userCardsData', JSON.stringify(this.userCards()));
                localStorage.setItem('availableCardsData', JSON.stringify(this.availableCards()));
            }),
            catchError((error) => {
                this.userCards.set(prevUserCards);
                this.availableCards.set(prevAvailableCards);
                this.errorService.showError('Failed to select card.');
                return throwError(() => new Error('Failed to select card.'));
            })
        );
    }



    removeUserCard(card: Card) {
        const prevUserCards = this.userCards();
        const prevAvailableCards = this.availableCards();
    
        if (prevUserCards.some((c) => c.id === card.id)) {
            this.userCards.set(prevUserCards.filter((c) => c.id !== card.id));
            this.availableCards.set([...prevAvailableCards, card]);
    
            // Update local storage
            localStorage.setItem('userCardsData', JSON.stringify(this.userCards()));
            localStorage.setItem('availableCardsData', JSON.stringify(this.availableCards()));
        }
    
        return this.httpClient.delete(`http://localhost:3000/user-cards/${card.id}`).pipe(
            tap(() => {
                console.log(`Card ${card.title} removed successfully`);
            }),
            catchError((error) => {
                // Revert local state
                this.userCards.set(prevUserCards);
                this.availableCards.set(prevAvailableCards);
    
                // Revert local storage
                localStorage.setItem('userCardsData', JSON.stringify(prevUserCards));
                localStorage.setItem('availableCardsData', JSON.stringify(prevAvailableCards));
    
                this.errorService.showError('Failed to unselect card.');
                return throwError(() => new Error('Failed to unselect card.'));
            })
        );
    }


    private fetchCards(url: string, errorMessage: string) {
        return this.httpClient.get<{ cards: Card[] }>(url).pipe(
            map((resData) => resData.cards),
            catchError((error) => {
                console.error(error);
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    checkUserCardsOrder(targetOrder: string[]): boolean {
        const currentOrder = this.userCards().map((card) => card.title);
        return JSON.stringify(currentOrder) === JSON.stringify(targetOrder);
    }


    // Local session reset
    resetCards() {
        const currentUserCards = this.userCards();
        const currentAvailableCards = this.availableCards();

        // Reset all user cards to available cards
        this.availableCards.set([...currentAvailableCards, ...currentUserCards]);

        // Clear user cards
        this.userCards.set([]);

        // Update local storage
        localStorage.setItem('userCardsData', JSON.stringify(this.userCards()));
        localStorage.setItem('availableCardsData', JSON.stringify(this.availableCards()));
    }

    // Backend reset
    resetCardsCompletely() {
        return this.httpClient.post<{ cards: Card[] }>('http://localhost:3000/reset-cards', {}).pipe(
            tap((response) => {
                // Set all cards back to available
                this.availableCards.set(response.cards);
                
                // Clear user cards
                this.userCards.set([]);
            }),
            catchError((error) => {
                this.errorService.showError('Failed to reset cards.');
                return throwError(() => new Error('Failed to reset cards.'));
            })
        );
    }

}