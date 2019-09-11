import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { models, Page, VisualDescriptor } from 'powerbi-client';
import { IEmbedConfiguration, IEmbedSettings } from 'embed';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { IEmbedInfo, RoleType, TokenRI, ReportEvent } from '../app-models';
import { AppUtilService } from '../app-util.service';
import { Report } from 'report';
import { ISlicerState, IBasicFilter } from 'powerbi-models';

@Component({
  selector: 'app-mainpanel',
  templateUrl: './mainpanel.component.html',
  styleUrls: ['./mainpanel.component.scss']
})
export class MainpanelComponent implements OnInit {
  @ViewChild('pbiContainer')
  pbiContainer: ElementRef;

  selectedStudents: Array<any>;

  countDownSeconds: number;

  showFilterPane: boolean;

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService,
    private appUtilService: AppUtilService
  ) { }

  ngOnInit(): void {
    this.selectedStudents = [];
    this.localStorage.getItem('showFilterPane')
      .subscribe((res: any) => {
        this.showFilterPane = res;
      });
  }

  onEmbed(embedInfo: IEmbedInfo): void {
    let group = embedInfo.group;
    let report = embedInfo.report;
    let applyRLS = embedInfo.applyRLS;
    let customData: string;
    let role: RoleType;
    if (applyRLS) {
      customData = embedInfo.customData;
      role = embedInfo.role;
    }
    this.embed(group.id, report.id, report.datasetId, report.embedUrl, applyRLS, customData, role);
  }

  embed(groupId: string, reportId: string, datasetId: string, embedUrl: string, applyRls?: boolean, customData?: string, role?: string): void {
    this.localStorage.getItem('username')
      .subscribe((username: string) => {
        let settings: IEmbedSettings = {
          filterPaneEnabled: this.showFilterPane
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
        this.appUtilService.getReportEmbedToken(reqData, groupId, reportId)
          .subscribe((tokenRI: TokenRI) => {
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
            let powerbiService = this.appUtilService.getPowerBIService();
            let reportContainer = this.pbiContainer.nativeElement;
            if (reportContainer) {
              powerbiService.reset(reportContainer);
              let report = <Report>powerbiService.embed(reportContainer, config);
              if (report) {
                let reportEvents: Array<ReportEvent> = [
                  { name: 'rendered', handler: this.onReportRendered.bind(this, report) },
                  { name: 'loaded', handler: this.onReportLoaded.bind(this, report) }
                ];
                this.appUtilService.addEventsToReport(report, reportEvents);
              }
            }
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
    console.log('Report Rendered');
  }

  private onReportLoaded(report: Report, customEvent: CustomEvent): void {
    console.log('Report Loaded');
    setTimeout(() => {
      report.getPages()
        .then((pages: Array<Page>) => {
          console.log('[Info]', pages);
          let page = pages.find((page: Page) => page.name === 'ReportSectionTeacher' && page.isActive === true);
          if (page) {
            page.getVisuals().then((visuals: Array<VisualDescriptor>) => {
              let slicerVisual = visuals.find((visual: VisualDescriptor) => visual.title === 'CalendarDateFilter');
              if (slicerVisual) {
                return slicerVisual.getSlicerState().then((state: ISlicerState) => {
                  let monthFilter = <IBasicFilter>state.filters[0];
                  if (monthFilter && monthFilter.values.indexOf('Sep-2019') === -1) {
                    monthFilter.values = ['Sep-2019'];
                    return slicerVisual.setSlicerState(state);
                  } else {
                    throw new Error(`Either the Slicer doesn't have filter or the filter is already applied`);
                  }
                });
              }
            });
          } else {
            throw new Error('NoSuchPageActiveError');
          }
        });
      this.toasterService.pop('success', 'Reports', 'Report Loaded')
    });
  }

}
