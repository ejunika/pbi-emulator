import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { models, Page, VisualDescriptor } from 'powerbi-client';
import { IEmbedConfiguration, IEmbedSettings } from 'embed';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { IEmbedInfo, RoleType, TokenRI, ReportEvent, AppConfigChangeItem } from '../app-models';
import { AppUtilService } from '../app-util.service';
import { Report } from 'report';
import { ISlicerState, IBasicFilter } from 'powerbi-models';
import { Router, ActivatedRoute } from '@angular/router';
import { Service } from 'service';

@Component({
  selector: 'app-mainpanel',
  templateUrl: './mainpanel.component.html',
  styleUrls: ['./mainpanel.component.scss']
})
export class MainpanelComponent implements OnInit {
  @ViewChild('pbiContainer')
  pbiContainerRef: ElementRef;

  @ViewChild('performanceModal')
  performanceModalRef: ElementRef;

  selectedStudents: Array<any>;

  countDownSeconds: number;

  showFilterPane: boolean;

  currentReportPerformance: {
    reportName?: string;
    preload?: { [key: string]: Date };
    tokenGeneration?: { [key: string]: Date };
    loaded?: { [key: string]: Date };
    rendered?: { [key: string]: Date };
  } = {};

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService,
    private appUtilService: AppUtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.selectedStudents = [];
    this.localStorage.getItem('showFilterPane')
      .subscribe((res: any) => {
        this.showFilterPane = res;
      });
    this.appUtilService.appConfigChangeNotifier
      .subscribe((appConfigChangeItem: AppConfigChangeItem) => {
        if (appConfigChangeItem.showFilterPaneChange) {
          this.appUtilService.getItem('showFilterPane')
            .subscribe((showFilterPane: boolean) => {
              this.showFilterPane = showFilterPane;
            });
        }
      });
  }

  onEmbed(embedInfo: IEmbedInfo): void {
    let group = embedInfo.group;
    let report = embedInfo.report;
    let applyRLS = embedInfo.applyRLS;
    let reportName = embedInfo.reportName;
    let customData: string;
    let role: RoleType;
    if (applyRLS) {
      customData = embedInfo.customData;
      role = embedInfo.role;
    }
    this.embed(group.id, report.id, report.datasetId, report.embedUrl, applyRLS, customData, role, reportName);
  }

  embed(groupId: string, reportId: string, datasetId: string, embedUrl: string, applyRls?: boolean, customData?: string, role?: string, reportName?: string): void {
    this.currentReportPerformance.reportName = reportName;
    this.localStorage.getItem('username')
      .subscribe((username: string) => {
        let settings: IEmbedSettings = {
          filterPaneEnabled: this.showFilterPane,
          navContentPaneEnabled: true
        };
        let reqData: any = {
          accessLevel: 'view'
        };
        if (applyRls) {
          reqData.identities = [
            {
              username: username,
              customData: customData,
              roles: [role],
              datasets: [datasetId]
            }
          ];
        }
        this.currentReportPerformance.tokenGeneration = {
          startDate: new Date(),
          endDate: null
        };
        this.appUtilService.getReportEmbedToken(reqData, groupId, reportId)
          .subscribe((tokenRI: TokenRI) => {
            this.currentReportPerformance.tokenGeneration.endDate = new Date();
            let config: IEmbedConfiguration = {
              type: 'report',
              accessToken: tokenRI.token,
              embedUrl: embedUrl,
              tokenType: models.TokenType.Embed,
              settings: settings
            };
            let defaultPageName = this.getDefaultPageName();
            if (defaultPageName) {
              config.pageName = defaultPageName;
            }
            this.appUtilService.getPowerBIService()
              .subscribe((powerbiService: Service) => {
                let reportContainer = this.pbiContainerRef.nativeElement;
                if (reportContainer) {
                  this.router.navigate(['.'], {
                    relativeTo: this.activatedRoute,
                    queryParams: this.appUtilService.getQueryParams()
                  });
                  powerbiService.reset(reportContainer);
                  this.currentReportPerformance.loaded = {
                    startDate: new Date()
                  };
                  let report: Report = <Report>powerbiService.load(reportContainer, config);
                  if (report) {
                    window['report'] = report;
                    const reportEvents: Array<ReportEvent> = [
                      { name: 'rendered', handler: this.onReportRendered.bind(this, report) },
                      { name: 'loaded', handler: this.onReportLoaded.bind(this, report) }
                    ];
                    this.appUtilService.addEventsToReport(report, reportEvents);
                  }
                }
              });
          });
      });
  }

  getDefaultPageName(): string {
    return 'ReportSectionTeacher';
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  getClass(): string {
    let classes = 'primary, secondary, success, danger, warning, info, light, dark'.split(', ');
    return 'badge-' + classes[this.getRandomInt(0, 7)];
  }

  private onReportRendered(report: Report, customEvent: CustomEvent): void {
    this.currentReportPerformance.rendered.endDate = new Date();
    this.analysePerformance();
  }

  private onReportLoaded(report: Report, customEvent: CustomEvent): void {
    this.currentReportPerformance.loaded.endDate = new Date();
    this.currentReportPerformance.rendered = {
      startDate: new Date(),
      endDate: null
    };
    report.getPages()
      .then((pages: Array<Page>) => {
        console.log('[Info]', pages);
        report.render();
      });
    // this.toasterService.pop('success', 'Reports', 'Report Loaded');
  }

  private analysePerformance(): void {
    $(this.performanceModalRef.nativeElement).appendTo('body').modal('show');
  }

}
