import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppData } from './app-models';

@Injectable()
export class AppResolverService implements Resolve<AppData> {

  constructor() { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppData> | Promise<AppData> | AppData {
    return new AppData();
  }

}
