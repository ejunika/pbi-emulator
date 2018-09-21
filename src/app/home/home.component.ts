import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as $ from 'jquery';
import 'bootstrap';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { LeftpanelComponent } from '../leftpanel/leftpanel.component';

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

  @ViewChild('leftPanel')
  leftPanel: LeftpanelComponent;

  azureAccessToken: string = '';

  username: string = '';

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {

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
