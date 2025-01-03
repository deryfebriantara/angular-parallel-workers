import { Injectable } from '@angular/core';
import { Subject, Observable, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventSubject = new Subject<{ type: string; payload: any }>();

  emit(event: { type: string; payload: any }) {
    this.eventSubject.next(event);
  }

  on(eventType: string): Observable<any> {
    return this.eventSubject.asObservable().pipe(
      filter((event) => event.type === eventType),
      map((event) => event.payload)
    );
  }
}
