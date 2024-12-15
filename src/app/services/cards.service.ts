import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Card } from '../cards/cards.model';

@Injectable({
    providedIn: 'root',
})
export class CardsService {

    exodiaSummoned = signal(false); 
    
    private httpClient = inject(HttpClient);
    private errorService = inject(ErrorService);

    private userCards = signal<Card[]>([]);
    private availableCards = signal<Card[]>([]);

    loadedUserCards = this.userCards.asReadonly();
    loadedAvailableCards = this.availableCards.asReadonly();

    targetOrder: string[] = [
        'EX Legendary 1/5',
        'EX Legendary 2/5',
        'EX Legendary 3/5',
        'EX Legendary 4/5',
        'EX Legendary 5/5',
    ];

    constructor() {
        // Load initial state
        this.initializeLocalStorage();
        this.initializeAppState();

        const resetRequired = localStorage.getItem('appResetRequired');
        if (resetRequired === 'true') {
            this.resetCardsCompletely().subscribe();
            localStorage.removeItem('appResetRequired');
        }
    }


    private initializeAppState() {
        const resetRequired = localStorage.getItem('appResetRequired');

        if (resetRequired === 'true') {
            // Backend reset
            this.resetCardsCompletely().subscribe(() => {
                localStorage.removeItem('appResetRequired');
            });
        } else {
            // Force reset state
            this.resetCardsCompletely().subscribe({
                next: () => console.log('State reset completely on refresh'),
                error: (err) => console.error('Failed to reset cards:', err),
            });
        }
    }

    private initializeLocalStorage() {
        const savedAvailableCards = localStorage.getItem('availableCardsData');
        const savedUserCards = localStorage.getItem('userCardsData');

        if (savedAvailableCards) this.availableCards.set(JSON.parse(savedAvailableCards));
        if (savedUserCards) this.userCards.set(JSON.parse(savedUserCards));
    }

    private updateLocalStorage() {
        localStorage.setItem('userCardsData', JSON.stringify(this.userCards()));
        localStorage.setItem('availableCardsData', JSON.stringify(this.availableCards()));
    }

    loadAvailableCards(): Observable<Card[]> {
        return this.fetchCards('http://localhost:3000/exodia-parts', 'Error fetching available cards.').pipe(
            tap((cards) => {
                const userCardIds = new Set(this.userCards().map((card) => card.id));
                this.availableCards.set(cards.filter((card) => !userCardIds.has(card.id)));
                this.updateLocalStorage();
            })
        );
    }

    // Load User Cards
    loadUserCards() {
        return this.fetchCards('http://localhost:3000/user-cards', 'Error fetching user cards.').pipe(
            tap((cards) => {
                this.userCards.set(cards);
                this.syncAvailableCards();
            })
        );
    }

    private syncAvailableCards() {
        const userCardIds = new Set(this.userCards().map((card) => card.id));
        this.availableCards.set(
            this.availableCards().filter((card) => !userCardIds.has(card.id))
        );
    }

    // Add Card
    addCardToUserCards(card: Card): Observable<void> {
        if (this.userCards().some((c) => c.id === card.id)) return of();

        const updatedUserCards = [...this.userCards(), card];
        this.userCards.set(updatedUserCards);
        this.availableCards.set(this.availableCards().filter((c) => c.id !== card.id));
        this.updateLocalStorage();

        this.checkCardOrder();

        return this.httpClient.put<void>('http://localhost:3000/user-cards', { cardId: card.id }).pipe(
            catchError((error) => this.handleError('Failed to select card.', error))
        );
    }


    // Remove Card
    removeUserCard(card: Card): Observable<void> {
        if (!this.userCards().some((c) => c.id === card.id)) {
            console.warn('Card not found in user cards.');
            return of();
        }

        const updatedUserCards = this.userCards().filter((c) => c.id !== card.id);
        const updatedAvailableCards = [...this.availableCards(), card];

        this.userCards.set(updatedUserCards);
        this.availableCards.set(updatedAvailableCards);
        this.updateLocalStorage();

        return this.httpClient.delete<void>(`http://localhost:3000/user-cards/${card.id}`).pipe(
            catchError((error) => this.handleError('Failed to unselect card.', error))
        );
    }


    checkCardOrder() {
        const currentOrder = this.userCards().map((card) => card.title);

        if (currentOrder.length === this.targetOrder.length) {
            const isCorrectOrder = currentOrder.every((title, index) => title === this.targetOrder[index]);

            if (isCorrectOrder) {
                console.log('Exodia Summoned!');
                this.exodiaSummoned.set(true); // Set Exodia state
                this.applyCardEffects();
                this.triggerExodiaAnimation();

                setTimeout(() => {
                    this.resetCards();
                    this.exodiaSummoned.set(false); // Reset Exodia state
                }, 4000);
            } else {
                alert('Exodia refuses this order!');
                this.resetCards();
            }
        }
    }
    

    private applyCardEffects() {
        // Wait for DOM updates
        setTimeout(() => {
            const userCards = document.querySelectorAll('.user-card-image');
    
            if (userCards.length === 0) {
                console.warn('No user cards found for animation.');
                return;
            }
    
            // Add animation class
            userCards.forEach((card) => {
                card.classList.add('exodia-effect');
            });
    
            // Remove animation after timeout
            setTimeout(() => {
                userCards.forEach((card) => card.classList.remove('exodia-effect'));
            }, 3000); // Match animation duration
        }, 0); // Execute after DOM update
    }
    


    private triggerExodiaAnimation() {
        const exodiaHeader = document.getElementById('exodia-header');
        const exodiaHeaderImg = document.querySelector('#exodia-header img');
    
        // Apply header glow
        if (exodiaHeader) {
            exodiaHeader.classList.add('exodia-glow');
            setTimeout(() => exodiaHeader.classList.remove('exodia-glow'), 3000);
        }
    
        // Apply cards animation
        if (exodiaHeaderImg) {
            exodiaHeaderImg.classList.add('exodia-header-effect');
            setTimeout(() => exodiaHeaderImg.classList.remove('exodia-header-effect'), 5000);
        }
    
        // Trigger card animations
        this.applyCardEffects();
    }
    
    

    private fetchCards(url: string, errorMessage: string): Observable<Card[]> {
        return this.httpClient.get<{ cards: Card[] }>(url).pipe(
            map((res) => res.cards),
            catchError((error) => this.handleError(errorMessage, error))
        );
    }

    private handleError(message: string, error: any): Observable<never> {
        console.error(message, error);
        this.errorService.showError(message);
        return throwError(() => new Error(message));
    }

    resetCards() {
        this.userCards.set([]);
        this.availableCards.set([]);
        this.loadAvailableCards().subscribe({
            next: () => {
                this.updateLocalStorage();
                console.log('Cards reset successfully');
            },
            error: (err) => console.error('Failed to reset cards:', err),
        });
    }


    resetCardsCompletely(): Observable<void> {
        return this.httpClient.post<{ cards?: Card[] }>('http://localhost:3000/reset-cards', {}).pipe(
            tap((response) => {
                const cards = response.cards || []; 
                this.availableCards.set(cards);  
                this.userCards.set([]);            
                this.updateLocalStorage();
            }),
            map(() => undefined),
            catchError((error) => this.handleError('Failed to reset cards.', error))
        );
    }






}
