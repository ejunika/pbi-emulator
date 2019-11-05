import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppData } from './app-models';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { map, tap, mergeMap, flatMap, first, switchMap, take } from 'rxjs/operators';
import { AppUtilService } from './app-util.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AppResolverService implements Resolve<AppData> {

  azureAccessToken: string;

  constructor(
    private jwtHelperService: JwtHelperService,
    private localStorage: LocalStorage,
    private appUtilService: AppUtilService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppData> | Promise<AppData> | AppData {
    const appData = new AppData();
    this.updateAppData(appData, route);
    return forkJoin([this.getTokenRemainingSeconds()
      .pipe(map((countDownSeconds: number) => {
        appData.countDownSeconds = countDownSeconds;
        this.appUtilService.appData = appData;
        return appData;
      })), this.updateUsername()])
      .pipe(map((finalRes: Array<any>) => {
        return finalRes[0];
      }));
  }

  getTokenRemainingSeconds(): Observable<number> {
    return this.localStorage.getItem('azureAccessToken')
      .pipe(map((azureAccessToken: string) => {
        this.azureAccessToken = azureAccessToken;
        const expiryDate: Date = this.jwtHelperService.getTokenExpirationDate(azureAccessToken);
        return this.getCountDownSeconds(expiryDate.toISOString());
      }));
  }

  updateUsername(): Observable<boolean> {
    return this.appUtilService.getItem('username')
      .pipe(mergeMap((username: string) => {
        let tokenInfo = this.jwtHelperService.decodeToken(this.azureAccessToken);
        if (username !== tokenInfo.unique_name) {
          return this.localStorage.setItem('username', tokenInfo.unique_name)
            .pipe(map((isDone: boolean) => {
              if (isDone) {
                this.appUtilService.alert('info', 'Token Manager', 'Username updated based on token');
              }
              return isDone;
            }));
        } else {
          return of(false)
        }
      }));
  }

  getCountDownSeconds(utfTimeStamp: string) {
    const currentISO = new Date().toISOString();
    const currentTime = Date.parse(currentISO);
    const expiration = Date.parse(utfTimeStamp);
    return (expiration - currentTime) / 1000;
  }

  updateAppData(appData: AppData, route: ActivatedRouteSnapshot): void {
    appData.currentGroupId = route.params.groupId;
    appData.currentReportId = route.params.reportId;
    appData.hasRLS = (() => route.queryParams.hasRLS && 'true' === route.queryParams.hasRLS.toLowerCase())();
    appData.cd = route.queryParams.cd ? decodeURIComponent(route.queryParams.cd) : '';
    appData.role = route.queryParams.role;
  }

}
