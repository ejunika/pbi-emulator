import { Injectable } from '@angular/core';
import { service, factories, Report } from 'powerbi-client';
import { Observable } from 'rxjs/Observable';
import { TokenRI, IGroup, GroupRI, IReport, ReportRI, AppData, AppConfigChangeItem, ReportEvent } from './app-models';
import { DataService } from './data.service';
import { map } from 'rxjs/operators/map';
import { Subject } from 'rxjs';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { tap } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster';

@Injectable()
export class AppUtilService {

  powerbiService: service.Service;
  appData: AppData;
  appConfigChangeNotifier: Subject<AppConfigChangeItem> = new Subject()

  constructor(
    private dataService: DataService,
    private toasterService: ToasterService,
    private localStorage: LocalStorage
  ) { }

  alert(type: string, title: string, message: string): void {
    this.toasterService.pop(type, title, message);
  }

  saveItem(key: string, value: any): Observable<boolean> {
    if (typeof value === 'string') {
      value = value.trim();
    }
    return this.localStorage.setItem(key, value)
      .pipe(tap((isDone: boolean) => {
        if (isDone) {
          this.appConfigChangeNotifier.next({ usernameChange: true });
          this.toasterService.pop('success', 'Storage', 'Preferance saved successfully!!');
        }
      }));
  }

  getItem(key: string): Observable<any> {
    return this.localStorage.getItem(key);
  }

  getPowerBIService(): service.Service {
    if (!this.powerbiService) {
      this.powerbiService = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    }
    return this.powerbiService;
  }

  getReportEmbedToken(reqData: any, groupId: string, reportId: string): Observable<TokenRI> {
    return this.dataService.post(reqData, 'myorg', ['groups', groupId, 'reports', reportId, 'GenerateToken']);
  }

  getGroups(): Observable<Array<IGroup>> {
    return this.dataService.get<GroupRI>('myorg', ['groups'])
      .pipe(map((groupRI: GroupRI) => {
        return groupRI.value;
      }));
  }

  getReports(groupId: string): Observable<Array<IReport>> {
    return this.dataService.get<ReportRI>('myorg', ['groups', groupId, 'reports'])
      .pipe(map((reportRI: ReportRI) => {
        return reportRI.value;
      }));
  }

  addEventsToReport(report: Report, events: Array<ReportEvent>): void {
    if (report && events) {
      events.forEach((event: ReportEvent) => {
        report.off(event.name, event.handler);
        report.on(event.name, event.handler);
      });
    }
  }

}
