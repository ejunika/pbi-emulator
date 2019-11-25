import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GroupService } from '../group.service';
import { ToasterService } from 'angular2-toaster';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { IEmbedInfo, IReport, IGroup, IRole, AppConfigChangeItem, TokenRI } from '../app-models';
import { AppUtilService } from '../app-util.service';
import { Router } from '@angular/router';
import { clone, uniqBy } from 'lodash';

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

  oneTimeEmbedToken: TokenRI;

  ontimeEmbedTokenPayload: {
    reports: Array<{ id: string }>;
    datasets: Array<{ id: string }>;
    targetWorkspaces?: Array<{ id: string }>;
    identities?: Array<{
      customData: string;
      username: string;
      datasets: Array<string>;
      roles: Array<string>;
    }>;
  };

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
    if (this.oneTimeEmbedToken) {
      embedInfo.tokenRI = this.oneTimeEmbedToken;
      this.embed.emit(embedInfo);
    } else {
      this.appUtilService.getOneTimeembedToken(this.ontimeEmbedTokenPayload)
        .subscribe((tokenRI: TokenRI) => {
          this.oneTimeEmbedToken = tokenRI;
          embedInfo.tokenRI = this.oneTimeEmbedToken;
          this.embed.emit(embedInfo);
        });
    }
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
        let reportsClone = clone(reports);
        this.ontimeEmbedTokenPayload = {
          reports: uniqBy(reportsClone.map((report: IReport) => {
            return { id: report.id };
          }), (item: IReport) => item.id),
          datasets: uniqBy(reportsClone.map((report: IReport) => {
            return { id: report.datasetId };
          }), (item: IReport) => item.id)
        };
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
