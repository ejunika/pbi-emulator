import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppUtilService } from '../app-util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {


  @Output('onClickRefreshToken')
  onClickRefreshToken: EventEmitter<void> = new EventEmitter<void>();

  @Output('onClickUpdateUsername')
  onClickUpdateUsername: EventEmitter<void> = new EventEmitter<void>();

  @Output('onClickManageDistrict')
  onClickManageDistrict: EventEmitter<void> = new EventEmitter<void>();

  reportExpiresIn: string;

  showTimer: boolean = false;

  interval: any;

  willTokenExpireShortly: boolean;

  constructor(
    private appUtilService: AppUtilService,
    private router: Router
  ) { }

  ngOnInit() {
    this.reportExpiresIn = '00:00:00';
    this.willTokenExpireShortly = false;
    this.onCountdownStart(this.appUtilService.appData.countDownSeconds)
  }

  openMangeAccountModal(): void {
    this.onClickUpdateUsername.emit();
  }

  openMangeTokenModal(): void {
    this.onClickRefreshToken.emit();
  }

  openMangeDistrictModal(): void {
    this.onClickManageDistrict.emit();
  }

  onCountdownStart(countdownSeconds: number): void {
    let wholeCountdownSeconds = parseInt(countdownSeconds.toString());
    this.reportExpiresIn = this.hhmmss(0);
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.showTimer = true;
    this.interval = setInterval(() => {
      --wholeCountdownSeconds;
      if (wholeCountdownSeconds <= 60) {
        this.willTokenExpireShortly = true;
      }
      if (wholeCountdownSeconds > 0) {
        this.reportExpiresIn = this.hhmmss(wholeCountdownSeconds);
      } else {
        this.reportExpiresIn = this.hhmmss(0);
        clearInterval(this.interval);
        this.router.navigate(['login']);
      }
    }, 1000);
  }

  pad(num: number) {
    return ('0' + num).slice(-2);
  }

  hhmmss(secs) {
    var minutes = Math.floor(secs / 60);
    secs = secs % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    return this.pad(hours) + ':' + this.pad(minutes) + ':' + this.pad(secs);
  }

}
