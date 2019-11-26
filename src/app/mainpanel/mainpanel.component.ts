import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { models, Page, VisualDescriptor } from 'powerbi-client';
import { IEmbedConfiguration, IEmbedSettings, IBootstrapEmbedConfiguration } from 'embed';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { IEmbedInfo, RoleType, TokenRI, ReportEvent, AppConfigChangeItem } from '../app-models';
import { AppUtilService } from '../app-util.service';
import { Report } from 'report';
import { ISlicerState, IBasicFilter } from 'powerbi-models';
import { Router, ActivatedRoute } from '@angular/router';
import { Service } from 'service';

let _this: MainpanelComponent;
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

  report: Report;

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
  ) { _this = this; }

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
    // this.bootstrapPowerbi();
  }

  bootstrapPowerbi(): void {
    this.appUtilService.getPowerBIService()
      .subscribe((powerbiService: Service) => {
        let bootstrapConfig: IBootstrapEmbedConfiguration = {
          type: 'report',
          hostname: 'https://app.powerbi.com'
        };
        powerbiService.bootstrap(this.pbiContainerRef.nativeElement, bootstrapConfig);
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
    this.currentReportPerformance = {
      preload: this.appUtilService.preload,
      reportName: '',
      tokenGeneration: {},
      loaded: {},
      rendered: {}
    };
    this.embedWithOneTimeEmbedToken(report.embedUrl, embedInfo.tokenRI.token);
    // this.embed(group.id, report.id, report.datasetId, report.embedUrl, applyRLS, customData, role, reportName);
  }

  embedWithOneTimeEmbedToken(embedUrl: string, embedToken: string): void {
    let settings: IEmbedSettings = {
      filterPaneEnabled: this.showFilterPane,
      navContentPaneEnabled: true
    };
    this.currentReportPerformance.tokenGeneration.endDate = new Date();
    let config: IEmbedConfiguration = {
      type: 'report',
      accessToken: embedToken,
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
          this.currentReportPerformance.loaded.startDate = new Date();
          this.report = <Report>powerbiService.embed(reportContainer, config);
          if (this.report) {
            const reportEvents: Array<ReportEvent> = [
              { name: 'rendered', handler: this.onReportRendered },
              { name: 'loaded', handler: this.onReportLoaded },
              { name: 'pageChanged', handler: this.onReportPageChanged },
            ];
            this.appUtilService.addEventsToReport(this.report, reportEvents);
          }
        }
      });
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
        this.currentReportPerformance.tokenGeneration.startDate = new Date();
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
                  this.currentReportPerformance.loaded.startDate = new Date();
                  let report: Report = <Report>powerbiService.load(reportContainer, config);
                  if (report) {
                    window['report'] = report;
                    const reportEvents: Array<ReportEvent> = [
                      { name: 'rendered', handler: this.onReportRendered.bind(this, report) },
                      { name: 'loaded', handler: this.onReportLoaded.bind(this, report) },
                      { name: 'pageChanged', handler: this.onReportPageChanged.bind(this, report) },
                    ];
                    this.appUtilService.addEventsToReport(report, reportEvents);
                  }
                }
              });
          });
      });
  }

  getDefaultPageName(): string {
    return '';
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

  private onReportRendered(customEvent: CustomEvent): void {
    _this.currentReportPerformance.rendered.endDate = new Date();
    _this.analysePerformance();
  }

  private onReportPageChanged(customEvent: CustomEvent): void {
    _this.currentReportPerformance.rendered.startDate = new Date();
  }

  private onReportLoaded(customEvent: CustomEvent): void {
    _this.currentReportPerformance.loaded.endDate = new Date();
    _this.currentReportPerformance.rendered.startDate = new Date();
    _this.report.getPages()
      .then((pages: Array<Page>) => {
        console.log('[Info]', pages);
      });
  }

  private analysePerformance(): void {
    $(this.performanceModalRef.nativeElement).appendTo('body').modal('show');
  }

}
