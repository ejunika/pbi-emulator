import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { LeftpanelComponent } from '../leftpanel/leftpanel.component';
import { AccordionPanel, Accordion } from '../ez-util/components/accordion/accordion-data-models';
import { AppUtilService } from '../app-util.service';
declare var $: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  @ViewChild('refreshToken')
  refreshTokenModal: ElementRef;

  @ViewChild('manageAccount')
  manageAccountModel: ElementRef;

  @ViewChild('manageDistrict')
  manageDistrictModel: ElementRef;

  @ViewChild('leftPanel')
  leftPanel: LeftpanelComponent;

  accordion: Accordion;

  azureAccessToken: string = '';

  username: string = '';

  showHelpOnStart: boolean;

  _showFilterPane: boolean;

  districtList: Array<any>;

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService,
    private appUtilService: AppUtilService
  ) { }

  set showFilterPane(flag: boolean) {
    this.localStorage.setItem('showFilterPane', flag).subscribe((res) => {
      this._showFilterPane = res;
    });
  }

  get showFilterPane(): boolean {
    return this._showFilterPane;
  }

  ngOnInit() {
    // this.accordion = new Accordion()
    //   .addPanel(new AccordionPanel('A', LeftpanelComponent))
    //   .addPanel(new AccordionPanel('B', LeftpanelComponent));
    // this.accordion.panels[0].body.instance.embed.subscribe((e) => {
    //   debugger;
    // });
    this.localStorage.getItem('dontShowNextTime').subscribe(dontShowNextTime => {
      this.showHelpOnStart = !dontShowNextTime;
    });
    this.localStorage.getItem('showFilterPane')
      .subscribe((res) => {
        this._showFilterPane = res;
      });
  }

  onChangeShowHelpOnStart(): void {
    this.localStorage.setItem('dontShowNextTime', !this.showHelpOnStart)
      .subscribe((isDone: boolean) => {
        if (isDone) {
          this.toasterService.pop('info', 'Account', 'Preference updated..');
        } else {
          this.toasterService.pop('danger', 'Account', 'Error');
        }
      });
  }

  openManageAccountModal(): void {
    let manageAccountModel = this.manageAccountModel.nativeElement;
    this.localStorage.getItem('username')
      .subscribe((username: string) => {
        this.username = username;
        if (manageAccountModel) {
          $(manageAccountModel).modal('show');
        }
      });
  }

  openManageDistrictModal(): void {
    let manageDistrictModel = this.manageDistrictModel.nativeElement;
    this.localStorage.getItem('districtList')
      .subscribe(districtMap => {
        this.districtList = districtMap || [];
        if (manageDistrictModel) {
          $(manageDistrictModel).modal('show');
        }
      });
  }

  saveUsername(): void {
    let manageAccountModel = this.manageAccountModel.nativeElement;
    if (manageAccountModel) {
      this.username = this.username ? this.username.trim() : '';
      this.localStorage.setItem('username', this.username)
        .subscribe((isDone: boolean) => {
          if (isDone) {
            this.appUtilService.appConfigChangeNotifier.next({ usernameChange: true });
            $(manageAccountModel).modal('hide');
            this.toasterService.pop('success', 'Account', 'Account updated successfully');
          }
        });
    } else {
      $(manageAccountModel).modal('hide');
    }
  }

  addMore(): void {
    this.districtList.push({
      name: '',
      uid: ''
    });
  }

  deleteDistrict(district: any): void {
    this.districtList.splice(this.districtList.indexOf(district), 1);
  }

  saveDistricts(): void {
    let manageDistrictModel = this.manageDistrictModel.nativeElement;
    this.districtList = this.districtList.filter(district => district.name && district.uid);
    this.localStorage.setItem('districtList', this.districtList)
      .subscribe((isDone: boolean) => {
        if (isDone) {
          if (manageDistrictModel) {
            $(manageDistrictModel).modal('hide');
          }
          this.appUtilService.appConfigChangeNotifier.next({ groupMappingChange: true });
          this.toasterService.pop('success', 'Manage District', 'District list updated');
        }
      });
  }

  saveAzureToken(): void {
    this.azureAccessToken = this.azureAccessToken.trim();
    this.localStorage.setItem('azureAccessToken', this.azureAccessToken).subscribe(res => {
      if (res) {
        let refreshTokenModal = this.refreshTokenModal.nativeElement;
        this.leftPanel.initGroups();
        // this.accordion.panels[0].body.initGroups();
        if (refreshTokenModal) {
          $(refreshTokenModal).modal('hide');
          this.toasterService.pop('success', 'Token', 'Token refresed');
        }
      }
    });
  }

}
