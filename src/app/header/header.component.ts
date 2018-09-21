import { Component, OnInit, Output, EventEmitter } from '@angular/core';

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

  constructor() { }

  ngOnInit() {

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

}
