import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DataService } from '../data.service';
import { GroupService } from '../group.service';

@Component({
  selector: 'app-leftpanel',
  templateUrl: './leftpanel.component.html',
  styleUrls: ['./leftpanel.component.scss']
})
export class LeftpanelComponent implements OnInit {

  groups: Array<any>;
  reports: Array<any>;
  roles: Array<any>;

  selectedGroup: any;
  selectedReport: any;

  disableDistrictSelector: boolean = true;
  disableDashboardSelector: boolean = true;

  applyRLS: boolean;
  viewDisabled: boolean = true;
  customData: string = '';
  selectedRole: any;

  @Output()
  embed: EventEmitter<any> = new EventEmitter();

  constructor(
    private dataService: DataService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.initRoles();
    this.initGroups();
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

  onChangeGroup(group: any) {
    this.initReports(group.id);
  }

  onChangeReport(): void {
    if (this.selectedReport.name) {
      this.viewDisabled = false;
    } else {
      this.viewDisabled = true;
    }
  }

  viewDashboard(): void {
    this.embed.emit({
      group: this.selectedGroup,
      report: this.selectedReport,
      applyRLS: this.applyRLS,
      customData: this.applyRLS ? this.customData : '',
      role: this.applyRLS ? this.selectedRole.dex : ''
    });
  }

  initGroups(): void {
    this.dataService.get('myorg', ['groups']).subscribe((res) => {
      this.groups = this.groupService.transform(res.value);
      if (this.groups.length > 0) {
        this.disableDistrictSelector = false;
      }
    });
  }

  initReports(groupId: string): void {
    this.dataService.get('myorg', ['groups', groupId, 'reports']).subscribe((res) => {
      this.reports = res.value;
      if (this.reports.length > 0) {
        this.disableDashboardSelector = false;
      }
    });
  }

}
