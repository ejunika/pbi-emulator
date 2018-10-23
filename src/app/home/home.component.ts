import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { LeftpanelComponent } from '../leftpanel/leftpanel.component';
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

  azureAccessToken: string = '';

  username: string = '';

  showHelpOnStart: boolean;

  districtList: Array<any>;

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {
    this.localStorage.getItem('dontShowNextTime').subscribe(dontShowNextTime => {
      this.showHelpOnStart = !dontShowNextTime;
    });
  }

  onChangeShowHelpOnStart(): void {
    this.localStorage.setItem('dontShowNextTime', !this.showHelpOnStart).subscribe(res => {

    });
  }

  openRefreshTokenModal(): void {
    let refreshTokenModal = this.refreshTokenModal.nativeElement;
    this.localStorage.getItem('azureAccessToken').subscribe(azureAccessToken => {
      this.azureAccessToken = azureAccessToken;
      if (refreshTokenModal) {
        $(refreshTokenModal).modal('show');
      }
    });
  }

  openManageAccountModal(): void {
    let manageAccountModel = this.manageAccountModel.nativeElement;
    this.localStorage.getItem('username').subscribe(username => {
      this.username = username;
      if (manageAccountModel) {
        $(manageAccountModel).modal('show');
      }
    });
  }

  openManageDistrictModal(): void {
    let manageDistrictModel = this.manageDistrictModel.nativeElement;
    this.localStorage.getItem('districtList').subscribe(districtMap => {
      this.districtList = districtMap || [];
      if (manageDistrictModel) {
        $(manageDistrictModel).modal('show');
      }
    });
  }

  saveUsername(): void {
    this.username = this.username.trim();
    this.localStorage.setItem('username', this.username).subscribe(res => {
      if (res) {
        let manageAccountModel = this.manageAccountModel.nativeElement;
        if (manageAccountModel) {
          $(manageAccountModel).modal('hide');
          this.toasterService.pop('success', 'Account', 'Account updated successfully');
        }
      }
    });
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
    this.districtList = this.districtList.filter(district => district.name && district.uid);
    this.localStorage.setItem('districtList', this.districtList).subscribe(res => {
      if (res) {
        let manageDistrictModel = this.manageDistrictModel.nativeElement;
        if (manageDistrictModel) {
          $(manageDistrictModel).modal('hide');
        }
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
        if (refreshTokenModal) {
          $(refreshTokenModal).modal('hide');
          this.toasterService.pop('success', 'Token', 'Token refresed');
        }
      }
    });
  }

}
