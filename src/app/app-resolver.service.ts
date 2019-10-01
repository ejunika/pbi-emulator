import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppData } from './app-models';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { map } from 'rxjs/operators';
import { AppUtilService } from './app-util.service';

@Injectable()
export class AppResolverService implements Resolve<AppData> {

  constructor(
    private jwtHelperService: JwtHelperService,
    private localStorage: LocalStorage,
    private appUtilService: AppUtilService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppData> | Promise<AppData> | AppData {
    const appData = new AppData();
    return this.getTokenRemainingSeconds()
      .pipe(map((countDownSeconds: number) => {
        appData.countDownSeconds = countDownSeconds;
        this.appUtilService.appData = appData;
        return appData;
      }));
  }

  getTokenRemainingSeconds(): Observable<number> {
    return this.localStorage.getItem('azureAccessToken')
      .pipe(map((azureAccessToken: string) => {
        const expiryDate: Date = this.jwtHelperService.getTokenExpirationDate(azureAccessToken);
        return this.getCountDownSeconds(expiryDate.toISOString());
      }));
  }

  getCountDownSeconds(utfTimeStamp: string) {
    const currentISO = new Date().toISOString();
    const currentTime = Date.parse(currentISO);
    const expiration = Date.parse(utfTimeStamp);
    return (expiration - currentTime) / 1000;
  }

}
