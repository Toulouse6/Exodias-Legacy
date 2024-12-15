import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HttpEventType, HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { tap } from 'rxjs';

function loggingInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
) {

    console.log('[Outgoing Request]');
    console.log(request);

    // return next(req);

    return next(request).pipe(
        tap({
            next: event => {
                if (event.type === HttpEventType.Response) {
                    console.log('[INCOMING RESPONSE]');
                    console.log(event.status);
                    console.log(event.body);
                }
            }
        })
    );
}

bootstrapApplication(AppComponent, {
    // provider available for entire app:
    providers: [provideHttpClient(withInterceptors([loggingInterceptor]))],
}).catch((err) => console.error(err));
