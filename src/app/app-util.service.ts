import { Injectable } from '@angular/core';
import { service, factories, Report } from 'powerbi-client';
import { Observable } from 'rxjs/Observable';
import { TokenRI, IGroup, GroupRI, IReport, ReportRI, AppData } from './app-models';
import { DataService } from './data.service';
import { map } from 'rxjs/operators/map';

@Injectable()
export class AppUtilService {

  powerbiService: service.Service;
  appData: AppData;

  constructor(
    private dataService: DataService
  ) { }

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

  addEventsToReport(report: Report, events: Array<{ name: string, handler: (...args: any) => void }>): void {
    if (report && events) {
      events.forEach((event: { name: string, handler: () => void }) => {
        report.off(event.name, event.handler);
        report.on(event.name, event.handler);
      });
    }
  }

}
