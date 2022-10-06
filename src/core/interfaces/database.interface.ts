import {ReplaySubject} from 'rxjs';

export interface IDBEntity {
  [propName: string]: ReplaySubject<any>;
}
