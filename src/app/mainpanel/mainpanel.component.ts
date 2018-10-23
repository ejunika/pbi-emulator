import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { service, factories, models, Report } from 'powerbi-client';
import { parse } from 'papaparse';
import { DataService } from '../data.service';
import { IEmbedConfiguration, ISettings } from 'embed';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-mainpanel',
  templateUrl: './mainpanel.component.html',
  styleUrls: ['./mainpanel.component.scss']
})
export class MainpanelComponent implements OnInit {

  @ViewChild('pbiContainer')
  pbiContainer: ElementRef;

  @Output('onCountdownStart')
  onCountdownStart: EventEmitter<number> = new EventEmitter<number>();

  selectedStudents: Array<any>;

  countDownSeconds: number;

  constructor(
    private dataService: DataService,
    private localStorage: LocalStorage,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.selectedStudents = [];
  }

  onEmbed(e): void {
    let group = e.group;
    let report = e.report;
    let applyRLS = e.applyRLS;
    let customData;
    let role;
    if (applyRLS) {
      customData = e.customData;
      role = e.role;
    }
    this.embed(group.id, report.id, report.datasetId, report.embedUrl, applyRLS, customData, role);
  }

  updateSelectedStudents(students: Array<any>): void {
    this.selectedStudents = [];
    for (let i = 0; i < students.length; i++) {
      this.selectedStudents.push({
        studentName: students[i].identity[0].equals,
        background: this.getClass()
      });
    }
  }

  createGroup(): void {

  }

  initDataSelectListner(): void {
    const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    const reportContainer = this.pbiContainer.nativeElement;
    const report = powerbi.get(reportContainer);
    report.off('dataSelected');
    report.on('dataSelected', (e) => {
      const detail: any = e.detail;
      debugger;
      if (detail.visual.name === '9cf4ef6cbed7d87040c0') {
        this.updateSelectedStudents(detail['dataPoints']);
      }
    });
  }

  embed(groupId, reportId, datasetId, embedUrl, applyRls?, customData?, role?): void {
    this.localStorage.getItem('username').subscribe(username => {
      const settings: IEmbedConfigurationSettings = {
        filterPaneEnabled: false
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
        ]
      }
      this.dataService.post(reqData, 'myorg', ['groups', groupId, 'reports', reportId, 'GenerateToken']).subscribe((res) => {
        let currentISO = new Date().toISOString();
        let currentTime = Date.parse(currentISO);
        let expiration = Date.parse(res.expiration);
        let countdownSeconds = (expiration - currentTime) / 1000;
        this.onCountdownStart.emit(countdownSeconds);
        const config: IEmbedConfiguration = {
          type: 'report',
          accessToken: res.token,
          embedUrl: embedUrl,
          tokenType: models.TokenType.Embed,
          settings: settings
        };
        const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
        const reportContainer = this.pbiContainer.nativeElement;
        if (reportContainer) {
          powerbi.reset(reportContainer);
          const report = <Report>powerbi.embed(reportContainer, config);
          if (report) {
            report.off('loaded');
            report.on('loaded', () => {
              this.toasterService.pop('info', 'Reports', 'Report loaded');
            });
            report.off('rendered');
            report.on('rendered', () => {
              this.toasterService.pop('success', 'Reports', 'Report rendered');
            });
          }
        }
      });
    });
  }

  getSelectedStudent(): void {
    this.checkForUnderlayingData();
  }

  checkForUnderlayingData(): void {
    const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    const reportContainer = this.pbiContainer.nativeElement;
    const report = <Report>powerbi.get(reportContainer);
    report.getPages().then((pages) => {
      let activePage = pages.find((page) => page.isActive);
      activePage.getVisuals().then((visuals) => {
        // let visual = visuals.find((visual) => visual.name == "41c8fb229814d771992d"); // Student List (Table)
        let visual = visuals.find((visual) => visual.name == "ba94b278491cb08c1ab1"); // StudentID (Table)
        // let visual = visuals.find((visual) => visual.name == "9cf4ef6cbed7d87040c0"); // Student List (Slicer)
        // let visual = visuals.find((visual) => visual.name == "9cf4ef6cbed7d87040c0"); //
        // let visual = visuals.find((visual) => visual.name == "dfc271fa4cbd997d0291"); // By School
        visual.exportData(models.ExportDataType.Summarized).then((result) => {
          let csvData = result['data']; // We will get CSV data
          let data = parse(csvData, {
            complete: (parseResult, file) => {
              console.log('[Summarized Data]: ', parseResult);
            },
            error: (error, file) => { },
            skipEmptyLines: true
          });
          //this.selectedStudents = result['data'];
        }).catch((errors) => {
          console.error(errors);
        });
      }).catch((errors) => {
        console.error(errors);
      });
    }).catch((errors) => {
      console.error(errors);
    });
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  getClass(): String {
    const classes = 'primary, secondary, success, danger, warning, info, light, dark'.split(', ');
    return 'badge-' + classes[this.getRandomInt(0, 7)];
  }

}

interface IEmbedConfigurationSettings extends ISettings {
  filterPaneEnabled?: boolean;
}
