import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataService } from '../data.service';
import { GroupService } from '../group.service';
import { ToasterService } from 'angular2-toaster';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { IEmbedInfo, GroupRI, ReportRI, IReport, IGroup, IRole } from '../app-models';
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
    this.initRoles();
    this.initGroups();
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
