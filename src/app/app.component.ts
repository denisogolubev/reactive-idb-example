import {ChangeDetectionStrategy, Component, isDevMode, OnInit} from '@angular/core';
import {DatabaseService} from '../core/services/database/database.service';
import {ReactiveIDb} from '../core/services/database/reactive-i-db';
import {ReactiveIDBDatabase} from '@creasource/reactive-idb';
import {take} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'test-project';

  constructor(
    private dbService: DatabaseService,
    private reactiveIDb: ReactiveIDb,
    ) {
  }

  ngOnInit(): void {
    this._reactiveIDbExample();
    // this.customDB();
  }

  private _reactiveIDbExample(): void {
    /**
     * Create DB
     */
    this.reactiveIDb.createDB().subscribe((db: ReactiveIDBDatabase) => console.log(db));


    if (isDevMode()) {
      /**
       * Drop DB if you need
       */
      // this.reactiveIDb.dropData().subscribe();
      /**
       * Console all data from DB
       */
      this.reactiveIDb.getAllData().pipe(take(1)).subscribe();
    }

    /**
     * Put some data
     */
    setTimeout(() => {
      this.reactiveIDb.put<{name: string}>('key2', {name: 'Denis'}, 2).subscribe();
    }, 2000)

    /**
     * Get some data
     */
    setTimeout(() => {
      this.reactiveIDb.get('key2')
        .subscribe((value) => console.log('Value from DB: ', value));
    }, 3000)
  }

  private customDBExample(): void {
    this.dbService.put<string>('key', 'some value');
    this.dbService.get<string>('key').subscribe((res) => console.log('Subs1: ', res));
  }

  public putSomeValue(): void {
    const random: string = (Math.random() * 100).toString();
    this.dbService.put<string>('key', `value ${random}`, 4000);
  }

  public consoleDB(): void {
    this.dbService.consoleDB();
  }
}
