import {ReactiveIDBDatabase} from '@creasource/reactive-idb';
import {Injectable} from '@angular/core';
import {concatMap, map, Observable} from 'rxjs';
import {ReactiveIDBObjectStore} from '@creasource/reactive-idb/build/main/lib/reactive-idb-object-store';
import {ReactiveIDBDatabaseSchema} from '@creasource/reactive-idb/build/main/lib/reactive-idb-database';
import {ReactiveIDBTransaction} from '@creasource/reactive-idb/build/main/lib/reactive-idb-transaction';

/**
 * reactive-idb plugin
 * https://github.com/creasource/reactive-idb
 *
 * Build size with this plugin 127.17 kB
 */

/**
 * Move this interfaces to your interfaces file (if you need that)
 */
interface IDBEntity<T = unknown> {
  key: string;
  cacheTime: Date;
  data: T;
}

interface IDBStoredData<T = unknown> {
  isExpired: boolean;
  data: IDBEntity<T>;
}

@Injectable({providedIn: 'root'})
export class ReactiveIDb {
  private readonly _DEFAULT_STORE_KEY: string = 'app-store';
  private readonly _DB_NAME: string = 'app-db';
  private _db$!: Observable<ReactiveIDBDatabase>;
  private _dbSchemas: ReactiveIDBDatabaseSchema[] = [{
    version: 1,
    stores: [this._DEFAULT_STORE_KEY]
  }];

  public createDB(): Observable<ReactiveIDBDatabase> {
    this._db$ = ReactiveIDBDatabase.create({
      name: this._DB_NAME,
      schema: this._dbSchemas
    });
    return this._db$;
  }

  public put<T>(key: string, value: T, cacheTime: number = 0): Observable<IDBValidKey> {
    return this._getObjectStore().pipe(
      concatMap((objectStore: ReactiveIDBObjectStore) => {
        const now: Date = new Date();
        const data: IDBEntity<T> = {
          key,
          cacheTime: new Date(now.setMinutes(now.getMinutes() + cacheTime)),
          data: value
        };
        return objectStore.put$(data, key);
      })
    );
  }

  public get<T>(key: string): Observable<IDBStoredData<T>> {
    return this._getObjectStore().pipe(
      concatMap((objectStore: ReactiveIDBObjectStore) => {
        const storedData$: Observable<IDBEntity> = objectStore.get$(key) as Observable<IDBEntity>;
        return storedData$.pipe(map((data: IDBEntity) => {
          if (data) {
            return {
              isExpired: this.isExpiredData(data.cacheTime),
              data
            };
          }
          return null;
        })) as Observable<IDBStoredData<T>>;
      })
    );
  }

  public getAllData(): Observable<IDBStoredData[]> {
    return this._getObjectStore().pipe(
      concatMap((objectStore: ReactiveIDBObjectStore) => objectStore.getAll$() as Observable<IDBEntity[]>),
      map((data: IDBEntity[]) => {
        const dbData: IDBStoredData[] = data.map((item: IDBEntity) => ({
          isExpired: this.isExpiredData(item.cacheTime),
          data: item
        }));
        const style: string = 'background-color: green; font-size: 1.2rem; padding: 4px 8px; border-radius: 6px';
        console.log('%cLast cached data in Database', style);
        console.log(dbData);
        return dbData;
      })
    );
  }

  public dropData(): Observable<void> {
    return this._db$.pipe(concatMap((db: ReactiveIDBDatabase) => db.clear$()));
  }

  private _getObjectStore(storeKey: string = this._DEFAULT_STORE_KEY): Observable<ReactiveIDBObjectStore> {
    return this._db$.pipe(
      concatMap((db: ReactiveIDBDatabase) => db.transaction$(storeKey, 'readwrite')),
      concatMap((transaction: ReactiveIDBTransaction) => transaction.objectStore$(storeKey))
    );
  }

  private isExpiredData(cacheTime: Date): boolean {
    const now: Date = new Date();
    return now > cacheTime;
  }
}
