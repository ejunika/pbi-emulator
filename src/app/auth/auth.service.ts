import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AuthService {

  constructor(
    private jwtHelperService: JwtHelperService,
    private localStorage: LocalStorage
  ) { }

  isAuthenticated(): Observable<boolean> {
    return this.localStorage.getItem('azureAccessToken')
      .pipe(map((azureAccessToken: string) => {
        let isTokenExpired = this.jwtHelperService.isTokenExpired(azureAccessToken);
        return !isTokenExpired;
      }));
  }

}
