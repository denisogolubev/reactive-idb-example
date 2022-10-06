import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {IDBEntity} from '../../interfaces/database.interface';

/**
 * Custom db if you need to store data only for session
 */
@Injectable({providedIn: 'root'})
export class DatabaseService {
  private readonly _simpleDB: IDBEntity = {} as IDBEntity;

  public put<T>(key: string, value: T, cacheTime: number = 2000): void {
    if (!this._item<T>(key)) {
      this._simpleDB[key] = new ReplaySubject<T>(1, cacheTime);
    }
    this._item<T>(key).next(value);
  }

  public get<T>(key: string): Observable<T> {
    if (!this._item<T>(key)) {
      this._simpleDB[key] = new ReplaySubject<T>(1, 0);
    }

    return this._simpleDB[key].asObservable();
  }

  private _item<T>(key: string): ReplaySubject<T> {
    return this._simpleDB[key];
  }

  public consoleDB(): void {
    console.log(this._simpleDB);
  }
}
