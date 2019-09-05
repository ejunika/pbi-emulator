import { Injectable } from '@angular/core';
import { service, factories } from 'powerbi-client';
import { Observable } from 'rxjs/Observable';
import { TokenRI } from './app-models';
import { DataService } from './data.service';

@Injectable()
export class AppUtilService {

  constructor(
    private dataService: DataService
  ) { }

  getPowerBIService(): service.Service {
    return new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
  }

  getReportEmbedToken(reqData: any, groupId: string, reportId: string): Observable<TokenRI> {
    return this.dataService.post(reqData, 'myorg', ['groups', groupId, 'reports', reportId, 'GenerateToken']);
  }

  getCountDownSeconds(utfTimeStamp: string) {
    let currentISO = new Date().toISOString();
    let currentTime = Date.parse(currentISO);
    let expiration = Date.parse(utfTimeStamp);
    return (expiration - currentTime) / 1000;
  }

}
