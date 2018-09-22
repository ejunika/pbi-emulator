import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  dontShowNextTime: boolean = true;

  constructor(
    private localStorage: LocalStorage,
    private router: Router
  ) { }

  ngOnInit() {
    this.localStorage.getItem('dontShowNextTime').subscribe(dontShowNextTime => {
      if (dontShowNextTime) {
        this.router.navigate(['home']);
      }
    });
  }

  start(): void {
    if (this.dontShowNextTime) {
      this.localStorage.setItem('dontShowNextTime', true).subscribe(res => {
        if (res) {
          this.router.navigate(['home']);
        }
      });
    }
  }

}
