import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private regions = ['North', 'South', 'East', 'West'];

  getRealTimeTransactions(): Observable<any> {
    return interval(500).pipe(
      map(() => ({
        id: Math.random().toString(36).substring(2),
        amount: Math.floor(Math.random() * 20000),
        region: this.regions[Math.floor(Math.random() * this.regions.length)],
      }))
    );
  }
}
