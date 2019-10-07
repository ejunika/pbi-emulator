import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GroupService } from '../group.service';
import { ToasterService } from 'angular2-toaster';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { IEmbedInfo, IReport, IGroup, IRole, AppConfigChangeItem } from '../app-models';
import { AppUtilService } from '../app-util.service';

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
    private localStorage: LocalStorage
  ) { }

  ngOnInit() {
    this.selectedRole = <IRole>{};
    this.loadSettings();
    this.loadCopyBtnConfig();
    this.initRoles();
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
    this.selectedGroup = group;
    this.initReports(group.id);
  }

  selectReport(report: IReport) {
    this.selectedReport = report;
    this.isTakenOff = false;
  }

  viewDashboard(): void {
    let embedInfo: IEmbedInfo = {
      group: this.selectedGroup,
      report: this.selectedReport,
      applyRLS: this.applyRLS,
      customData: this.applyRLS ? this.customData : '',
      role: this.applyRLS ? this.selectedRole.dex : ''
    };
    this.embed.emit(embedInfo);
    this.isTakenOff = true;
  }

  initGroups(): void {
    this.appUtilService.getGroups()
      .subscribe((groups: Array<IGroup>) => {
        this.groups = this.groupService.transform(groups);
        if (this.groups.length > 0) {
          this.disableDistrictSelector = false;
        }
      });
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
        if (this.reports.length > 0) {
          this.disableDashboardSelector = false;
        } else {
          this.toasterService.pop('info', 'Reports', 'No report found in this district');
        }
      });
  }

}
