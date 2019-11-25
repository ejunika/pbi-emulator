import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GroupService } from '../group.service';
import { ToasterService } from 'angular2-toaster';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { IEmbedInfo, IReport, IGroup, IRole, AppConfigChangeItem, TokenRI } from '../app-models';
import { AppUtilService } from '../app-util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leftpanel',
  templateUrl: './leftpanel.component.html',
  styleUrls: ['./leftpanel.component.scss']
})
export class LeftpanelComponent implements OnInit {

  groups: Array<IGroup>;
  reports: Array<IReport>;
  roles: Array<IRole>;

  selectedGroup: IGroup;
  selectedReport: IReport;

  disableDistrictSelector: boolean = true;
  disableDashboardSelector: boolean = true;

  applyRLS: boolean;
  customData: string = '';
  selectedRole: IRole;
  username: string;
  rlsEnabled: boolean;
  isTakenOff: boolean = false;
  showCopyBtn: boolean = false;

  @Output()
  embed: EventEmitter<IEmbedInfo> = new EventEmitter();

  constructor(
    private appUtilService: AppUtilService,
    private groupService: GroupService,
    private toasterService: ToasterService,
    private localStorage: LocalStorage,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadSettings();
    this.loadCopyBtnConfig();
    this.initRoles();
    this.prepareRLS();
    this.initGroups();
    this.appUtilService.appConfigChangeNotifier
      .subscribe((appConfigChangeItem: AppConfigChangeItem) => {
        if (appConfigChangeItem) {
          if (appConfigChangeItem.groupMappingChange) {
            this.updateDistrict();
          } else if (appConfigChangeItem.usernameChange) {
            this.loadSettings();
          } else if (appConfigChangeItem.showCopyBtn) {
            this.loadCopyBtnConfig();
          }
        }
      });
  }

  loadCopyBtnConfig(): void {
    this.appUtilService.getItem('showCopyBtn')
      .subscribe((flag: boolean) => this.showCopyBtn = flag);
  }

  loadSettings(): void {
    this.rlsEnabled = false;
    this.localStorage.getItem('username')
      .subscribe((username: string) => {
        if (username) {
          this.rlsEnabled = true;
        }
      });
  }

  initRoles(): void {
    this.roles = [
      {
        name: 'Admin',
        dex: 'Admin'
      },
      {
        name: 'Teacher',
        dex: 'Teacher'
      }
    ];
  }

  onChangeGroup(group: IGroup) {
    this.initReports(group.id);
  }

  selectGroup(group: IGroup) {
    if (group) {
      this.selectedGroup = group;
      this.initReports(group.id);
    }
  }

  selectReport(report: IReport) {
    if (report) {
      this.selectedReport = report;
      this.router.navigate(['go', this.selectedGroup.id, 'reports', this.selectedReport.id], {
        queryParams: this.appUtilService.getQueryParams()
      });
      this.isTakenOff = false;
    }
  }

  viewDashboard(): void {
    let embedInfo: IEmbedInfo = {
      group: this.selectedGroup,
      report: this.selectedReport,
      applyRLS: this.appUtilService.appData.hasRLS,
      customData: this.appUtilService.appData.hasRLS ? this.appUtilService.appData.cd : '',
      role: this.appUtilService.appData.hasRLS ? this.appUtilService.appData.role : '',
      reportName: this.selectedReport.name
    };
    this.appUtilService.getEmbedTokenForAll({
      datasets: [
        {
          id: 'fd70ae41-bedf-4dd3-b91c-d84382c9a3c5'
        },
        {
          id: '54bb4f9e-5418-4237-8391-c0a42fd3fa29'
        },
        {
          id: 'f82a02a7-19cb-47e6-b402-df7f75380dde'
        }
      ],
      // identities: [
      //   {
      //     customData: '+dihHijeg68vIQpG3WJKZA==',
      //     datasets: ['bbebdbfd-4948-4a21-a47b-67f636087f9e', '68662378-c24e-4a5a-a6a3-c72d4c9e84a4'],
      //     reports: ['e8e1fe8f-5b89-47bb-b46b-4c2e96a5ad37', '9899edff-8d78-4d34-84ea-4dd738dff3c8'],
      //     roles: ['Teacher'],
      //     username: '00UIAD1PBIPRO@powerschool.cloud'
      //   }
      // ],
      reports: [
        {
          id: '36760b6a-166d-497c-943f-dac7d3c14023'
        },
        {
          id: 'b7f966ca-2d0d-409e-a1a6-adf866567cc5'
        },
        {
          id: '88bccbe5-b8c3-4f55-98d1-98f1d560f93b'
        }
      ],
      targetWorkspaces: [
        {
          id: '2542fc34-a10b-4cef-b7cf-7bb1b525f458'
        }
      ]
    }).subscribe((tokenRI: TokenRI) => {
      embedInfo.embedToken = tokenRI.token;
      this.embed.emit(embedInfo);
    });
    // this.embed.emit(embedInfo);
    this.isTakenOff = true;
  }

  initGroups(): void {
    this.groups = this.groupService.getCachedGroup();
    if (this.groupService.hasGroups) {
      this.selectGroup(this.getSelectedGroup.call(this));
      if (this.groups.length > 0) {
        this.disableDistrictSelector = false;
      }
    } else {
      this.appUtilService.getGroups()
        .subscribe((groups: Array<IGroup>) => {
          this.groups = this.groupService.transform(groups);
          this.selectGroup(this.getSelectedGroup.call(this));
          if (this.groups.length > 0) {
            this.disableDistrictSelector = false;
          }
        });
    }
  }

  updateDistrict(): void {
    this.groupService.initTenantMap().subscribe(() => {
      this.groups = this.groupService.transform(this.groups);
    });
  }

  initReports(groupId: string): void {
    this.selectedReport = <IReport>{};
    this.disableDashboardSelector = true;
    this.appUtilService.getReports(groupId)
      .subscribe((reports: Array<IReport>) => {
        this.reports = reports;
        this.selectReport(this.getSelectedReport.call(this));
        if (this.reports.length > 0) {
          this.disableDashboardSelector = false;
          if (this.selectedReport && this.selectedReport.id) {
            this.router.navigate(['go', this.selectedGroup.id, 'reports', this.selectedReport.id], {
              queryParams: this.appUtilService.getQueryParams()
            });
          } else {
            this.router.navigate(['go', this.selectedGroup.id], {
              queryParams: this.appUtilService.getQueryParams()
            });
          }
        } else {
          this.toasterService.pop('info', 'Reports', 'No report found in this district');
        }
      });
  }

  getSelectedGroup(): IGroup {
    return this.groups.find((group: IGroup) => group.id === this.appUtilService.appData.currentGroupId);
  }

  getSelectedReport(): IReport {
    return this.reports.find((report: IReport) => report.id === this.appUtilService.appData.currentReportId);
  }

  prepareRLS(): void {
    this.applyRLS = this.appUtilService.appData.hasRLS;
    this.customData = this.appUtilService.appData.cd;
    this.selectedRole = this.roles.find((role: IRole) => role.dex === this.appUtilService.appData.role) || <IRole>{};
  }

}
