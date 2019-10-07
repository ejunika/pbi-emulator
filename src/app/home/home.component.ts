import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { LeftpanelComponent } from '../leftpanel/leftpanel.component';
import { AppUtilService } from '../app-util.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
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

  _showFilterPane: boolean;

  _showCopyBtn: boolean;

  districtList: Array<any>;

  isOpenedSidenavLeft: boolean;

  isOpenedSidenavRight: boolean;

  usernameUpdate: Subject<string> = new Subject();

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService,
    private appUtilService: AppUtilService,
    private router: Router
  ) {
    this.usernameUpdate.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((username: string) => {
        this.appUtilService.saveItem('username', username).subscribe();
      });
  }

  set showCopyBtn(flag: boolean) {
    this.appUtilService.saveItem('showCopyBtn', flag)
      .pipe(tap((isDone: boolean) => {
        if (isDone) {
          this.appUtilService.appConfigChangeNotifier.next({ showCopyBtn: true });
          this._showCopyBtn = flag;
        }
      }))
      .subscribe();
  }

  set showFilterPane(flag: boolean) {
    this.appUtilService.saveItem('showFilterPane', flag)
      .pipe(tap((isDone: boolean) => {
        if (isDone) {
          this.appUtilService.appConfigChangeNotifier.next({ showFilterPaneChange: true });
          this._showFilterPane = flag;
        }
      }))
      .subscribe();
  }

  get showFilterPane(): boolean {
    return this._showFilterPane;
  }

  get showCopyBtn(): boolean {
    return this._showCopyBtn;
  }

  ngOnInit() {
    this.initAppConfig();
  }

  initAppConfig(): void {
    this.isOpenedSidenavLeft = true;
    this.isOpenedSidenavRight = false;
    this.localStorage.getItem('dontShowNextTime')
      .subscribe(dontShowNextTime => {
        this.showHelpOnStart = !dontShowNextTime;
      });
    this.localStorage.getItem('showFilterPane')
      .subscribe((res) => {
        this._showFilterPane = res;
      });
    this.localStorage.getItem('showCopyBtn')
      .subscribe((res) => {
        this._showCopyBtn = res;
      });
    this.localStorage.getItem('username')
      .subscribe((username: string) => {
        this.username = username;
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
      this.appUtilService.saveItem('username', this.username)
        .subscribe((isDone: boolean) => {
          if (isDone) {
            $(manageAccountModel).modal('hide');
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

  signout(): void {
    this.localStorage.removeItem('azureAccessToken')
      .subscribe((isDone: boolean) => {
        if (isDone) {
          this.router.navigate(['login']);
        }
      });
  }

}
