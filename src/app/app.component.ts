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
    imports: [AvailableCardsComponent, UserCardsComponent, ErrorModalComponent],
})
export class AppComponent implements OnInit {
    private cardsService = inject(CardsService);
    private errorService = inject(ErrorService);

    error = this.errorService.error;

    ngOnInit() {
        this.checkAndResetIfNeeded();
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
    
    triggerExodiaEffects() {
        // Add visual effects for summoning Exodia
        const header = document.getElementById('exodia-header');
        if (header) {
            header.classList.add('exodia-glow'); // Apply animation class
        }

        // Reset after effects
        setTimeout(() => {
            if (header) {
                header.classList.remove('exodia-glow'); // Remove animation
            }
            this.cardsService.resetCards(); // Reset cards to initial state
        }, 3000); 
    }
}
