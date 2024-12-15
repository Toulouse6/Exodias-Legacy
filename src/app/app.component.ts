import { Component, inject, OnInit } from '@angular/core';
import { AvailableCardsComponent } from './cards/available-cards/available-cards.component';
import { UserCardsComponent } from './cards/user-cards/user-cards.component';
import { ErrorService } from './services/error.service';
import { CardsService } from './services/cards.service';
import { ErrorModalComponent } from './modal/error-model/error-modal.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [AvailableCardsComponent, UserCardsComponent],
})
export class AppComponent implements OnInit {
    private cardsService = inject(CardsService);
    private errorService = inject(ErrorService);

    error = this.errorService.error;

    ngOnInit() {
        this.checkAndResetIfNeeded();

        // Reset cards if no state exists
        const savedUserCards = localStorage.getItem('userCardsData');
        const savedAvailableCards = localStorage.getItem('availableCardsData');

        if (!savedUserCards || !savedAvailableCards) {
            this.cardsService.resetCards();
        }
    }

    private checkAndResetIfNeeded() {
        const resetRequired = localStorage.getItem('appResetRequired');

        if (resetRequired === 'true') {
            this.cardsService.resetCardsCompletely().subscribe({
                next: () => {
                    localStorage.removeItem('appResetRequired');
                },
                error: (error) => {
                    console.error('Auto reset failed', error);
                }
            });
        }
    }
}
